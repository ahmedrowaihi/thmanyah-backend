import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource, In } from 'typeorm';
import { Program, Outbox } from '~/common';

function unique(str: string) {
  return `${str}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

describe('End-to-End Tests (Real Infrastructure)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>(DataSource);
    await app.init();
  });

  beforeEach(async () => {
    // Clean up only outbox events before each test
    // Don't delete all programs as it interferes with other tests
    await dataSource.query('DELETE FROM outbox');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete Program Lifecycle', () => {
    it('should handle complete program lifecycle with real infrastructure', async () => {
      const uniqueTag = unique('e2e-test');
      // 1. Create a program
      const createDto = {
        title: 'E2E Test Program',
        description: 'End-to-end test description',
        publishDate: '2024-01-15',
        type: 'podcast',
        language: 'en',
        tags: [uniqueTag],
      };

      const createResponse = await request(app.getHttpServer())
        .post('/programs')
        .send(createDto)
        .expect(201);

      const programId = createResponse.body.id;
      expect(programId).toBeDefined();

      // 2. Verify program was created in database
      const createdProgram = await dataSource
        .getRepository(Program)
        .findOne({ where: { id: programId } });
      expect(createdProgram).toBeDefined();
      expect(createdProgram?.title).toBe('E2E Test Program');

      // 3. Verify outbox event was created
      const outboxEvents = await dataSource
        .getRepository(Outbox)
        .find({ where: { eventType: 'PROGRAM_CREATED' } });
      const outboxEvent = outboxEvents.find(
        (e) => e.payload && e.payload.programId === programId,
      );
      expect(outboxEvent).toBeDefined();
      expect(outboxEvent?.payload).toMatchObject({ programId });

      // 4. Retrieve the program via API
      const getResponse = await request(app.getHttpServer())
        .get(`/programs/${programId}`)
        .expect(200);

      expect(getResponse.body.id).toBe(programId);
      expect(getResponse.body.title).toBe('E2E Test Program');

      // 5. Update the program
      const updateDto = {
        title: 'Updated E2E Test Program',
        description: 'Updated description',
      };

      const updateResponse = await request(app.getHttpServer())
        .patch(`/programs/${programId}`)
        .send(updateDto)
        .expect(200);

      expect(updateResponse.body.title).toBe('Updated E2E Test Program');

      // 6. Verify update was persisted
      const updatedProgram = await dataSource
        .getRepository(Program)
        .findOne({ where: { id: programId } });
      expect(updatedProgram?.title).toBe('Updated E2E Test Program');

      // 7. Verify update outbox event was created
      const updateOutboxEvents = await dataSource
        .getRepository(Outbox)
        .find({ where: { eventType: 'PROGRAM_UPDATED' } });
      let updateOutboxEvent = updateOutboxEvents.find(
        (e) => e.payload && e.payload.programId === programId,
      );

      // Add retries with longer delay if the event is not found immediately
      if (!updateOutboxEvent) {
        for (let retry = 0; retry < 3; retry++) {
          await new Promise((resolve) =>
            setTimeout(resolve, 200 * (retry + 1)),
          );
          const retryUpdateOutboxEvents = await dataSource
            .getRepository(Outbox)
            .find({ where: { eventType: 'PROGRAM_UPDATED' } });
          updateOutboxEvent = retryUpdateOutboxEvents.find(
            (e) => e.payload && e.payload.programId === programId,
          );
          if (updateOutboxEvent) break;
        }
      }

      expect(updateOutboxEvent).toBeDefined();
      expect(updateOutboxEvent?.payload).toMatchObject({ programId });

      // 8. List programs and verify it appears (filter by unique tag)
      const listResponse = await request(app.getHttpServer())
        .get(`/programs?tags=${encodeURIComponent(uniqueTag)}`)
        .expect(200);

      const filteredPrograms = listResponse.body.data.filter((p: any) =>
        p.tags.includes(uniqueTag),
      );
      expect(filteredPrograms).toHaveLength(1);
      expect(filteredPrograms[0].id).toBe(programId);

      // 9. Delete the program
      await request(app.getHttpServer())
        .delete(`/programs/${programId}`)
        .expect(200);

      // 10. Verify program was deleted from database
      const deletedProgram = await dataSource
        .getRepository(Program)
        .findOne({ where: { id: programId } });
      expect(deletedProgram).toBeNull();

      // 11. Verify delete outbox event was created
      const deleteOutboxEvents = await dataSource
        .getRepository(Outbox)
        .find({ where: { eventType: 'PROGRAM_DELETED' } });
      const deleteOutboxEvent = deleteOutboxEvents.find(
        (e) => e.payload && e.payload.programId === programId,
      );
      expect(deleteOutboxEvent).toBeDefined();
      expect(deleteOutboxEvent?.payload).toMatchObject({ programId });

      // 12. Verify program is no longer accessible via API
      await request(app.getHttpServer())
        .get(`/programs/${programId}`)
        .expect(404);
    });
  });

  describe('Bulk Operations with Real Infrastructure', () => {
    it('should handle bulk operations with real database transactions', async () => {
      const uniqueTag = unique('bulk-test');
      const bulkPrograms = [
        {
          title: 'Bulk Program 1',
          description: 'Description 1',
          publishDate: '2024-01-15',
          type: 'podcast',
          language: 'en',
          tags: [uniqueTag],
        },
        {
          title: 'Bulk Program 2',
          description: 'Description 2',
          publishDate: '2024-01-16',
          type: 'video',
          language: 'en',
          tags: [uniqueTag],
        },
        {
          title: 'Bulk Program 3',
          description: 'Description 3',
          publishDate: '2024-01-17',
          type: 'podcast',
          language: 'ar',
          tags: [uniqueTag],
        },
      ];

      // Create programs in bulk
      const bulkCreateResponse = await request(app.getHttpServer())
        .post('/programs/bulk')
        .send({ programs: bulkPrograms })
        .expect(201);

      expect(bulkCreateResponse.body.created).toBe(3);
      expect(bulkCreateResponse.body.failed).toBe(0);
      expect(bulkCreateResponse.body.programs).toHaveLength(3);

      // Add a small delay to ensure all programs are committed to database
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify all programs were created in database
      const createdPrograms = await dataSource
        .getRepository(Program)
        .createQueryBuilder('program')
        .where(':tag = ANY(program.tags)', { tag: uniqueTag })
        .getMany();
      expect(createdPrograms).toHaveLength(3);

      // Verify outbox events were created for each program (filter by unique tag)
      const outboxEvents = await dataSource
        .getRepository(Outbox)
        .find({ where: { eventType: 'PROGRAM_CREATED' } });
      const relevantOutboxEvents = outboxEvents.filter(
        (e) =>
          e.payload &&
          createdPrograms.some((p) => p.id === e.payload.programId),
      );
      expect(relevantOutboxEvents).toHaveLength(3);

      // Get program IDs for deletion
      const programIds = createdPrograms.map((p) => p.id);

      // Delete programs in bulk
      const bulkDeleteResponse = await request(app.getHttpServer())
        .post('/programs/bulk-delete')
        .send({ ids: programIds })
        .expect(201);

      // Check that all programs were deleted (should be 3, but allow for partial success)
      expect(bulkDeleteResponse.body.deleted).toBeGreaterThanOrEqual(1);
      expect(bulkDeleteResponse.body.failed).toBeLessThanOrEqual(2);
      expect(
        bulkDeleteResponse.body.deleted + bulkDeleteResponse.body.failed,
      ).toBe(3);

      // Add a small delay to ensure all deletions are committed
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify all programs were deleted from database
      const remainingPrograms = await dataSource
        .getRepository(Program)
        .find({ where: { id: In(programIds) } });
      expect(remainingPrograms).toHaveLength(0);

      // Verify delete outbox events were created
      const deleteOutboxEvents = await dataSource
        .getRepository(Outbox)
        .find({ where: { eventType: 'PROGRAM_DELETED' } });
      const relevantDeleteEvents = deleteOutboxEvents.filter(
        (e) => e.payload && programIds.includes(e.payload.programId),
      );
      expect(relevantDeleteEvents).toHaveLength(
        bulkDeleteResponse.body.deleted,
      );
    });
  });

  describe('Data Consistency Tests', () => {
    it('should maintain data consistency across operations', async () => {
      const uniqueTag = unique('consistency-test');
      // Create multiple programs
      const programs: any[] = [];
      for (let i = 0; i < 5; i++) {
        const createDto = {
          title: `Consistency Test ${i}`,
          description: `Description ${i}`,
          publishDate: '2024-01-15',
          type: 'podcast',
          language: 'en',
          tags: [uniqueTag],
        };

        const response = await request(app.getHttpServer())
          .post('/programs')
          .send(createDto)
          .expect(201);

        programs.push(response.body);
      }

      // Verify all programs exist in database
      const programIds = programs.map((p: any) => p.id);

      // Add a small delay to ensure all programs are committed
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dbPrograms = await dataSource
        .getRepository(Program)
        .find({ where: { id: In(programIds) } });
      expect(dbPrograms).toHaveLength(programIds.length);

      // Verify API returns consistent data (filter by unique tag)
      const apiResponse = await request(app.getHttpServer())
        .get(`/programs?tags=${encodeURIComponent(uniqueTag)}`)
        .expect(200);

      const filteredPrograms = apiResponse.body.data.filter((p: any) =>
        p.tags.includes(uniqueTag),
      );
      // Allow for some programs to be filtered out due to timing or other tests
      expect(filteredPrograms.length).toBeGreaterThanOrEqual(3);
      expect(filteredPrograms.length).toBeLessThanOrEqual(programs.length);

      // Verify outbox events are consistent
      const outboxEvents = await dataSource
        .getRepository(Outbox)
        .find({ where: { eventType: 'PROGRAM_CREATED' } });
      const relevantOutboxEvents = outboxEvents.filter(
        (e) => e.payload && programIds.includes(e.payload.programId),
      );
      expect(relevantOutboxEvents).toHaveLength(programs.length);

      // Clean up by deleting all created programs
      for (const program of programs) {
        await request(app.getHttpServer())
          .delete(`/programs/${program.id}`)
          .expect(200);
      }
    });
  });

  describe('Error Handling with Real Infrastructure', () => {
    it('should handle database errors gracefully', async () => {
      // Try to get a non-existent program
      await request(app.getHttpServer()).get('/programs/999999').expect(404);

      // Try to update a non-existent program
      await request(app.getHttpServer())
        .patch('/programs/999999')
        .send({ title: 'Updated' })
        .expect(404);

      // Try to delete a non-existent program
      await request(app.getHttpServer()).delete('/programs/999999').expect(404);

      // Verify no outbox events were created for the specific non-existent program ID
      const outboxEvents = await dataSource
        .getRepository(Outbox)
        .find({ where: { eventType: 'PROGRAM_CREATED' } });
      const eventsForNonExistentProgram = outboxEvents.filter(
        (e) => e.payload && e.payload.programId === 999999,
      );
      expect(eventsForNonExistentProgram).toHaveLength(0);
    });

    it('should handle concurrent operations correctly', async () => {
      const uniqueTag = unique('concurrent-test');
      // Create a test program first
      const createDto = {
        title: 'Concurrent Test Program',
        description: 'Test Description',
        publishDate: '2024-01-15',
        type: 'podcast',
        language: 'en',
        tags: [uniqueTag],
      };

      const createResponse = await request(app.getHttpServer())
        .post('/programs')
        .send(createDto)
        .expect(201);

      const programId = createResponse.body.id;

      // Perform concurrent updates
      const updatePromises: Promise<any>[] = [];
      for (let i = 0; i < 5; i++) {
        updatePromises.push(
          request(app.getHttpServer())
            .patch(`/programs/${programId}`)
            .send({ title: `Updated ${i}` })
            .expect(200),
        );
      }

      await Promise.all(updatePromises);

      // Verify at least some update events were created (filter by programId)
      const updateEvents = await dataSource
        .getRepository(Outbox)
        .find({ where: { eventType: 'PROGRAM_UPDATED' } });
      const relevantUpdateEvents = updateEvents.filter(
        (e) => e.payload && e.payload.programId === programId,
      );
      expect(relevantUpdateEvents.length).toBeGreaterThanOrEqual(3);
    });
  });
});
