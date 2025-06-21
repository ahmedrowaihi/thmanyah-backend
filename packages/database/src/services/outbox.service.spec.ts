import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository, EntityManager } from "typeorm";
import { OutboxService } from "./outbox.service";
import { Outbox } from "../entities/outbox.entity";
import { OutboxEvent } from "@thmanyah/shared";

describe("OutboxService", () => {
  let service: OutboxService;
  let outboxRepository: Repository<Outbox>;

  const mockOutboxEvent = {
    id: 1,
    eventType: "PROGRAM_CREATED",
    payload: { programId: 1 },
    processed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboxService,
        {
          provide: getRepositoryToken(Outbox),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OutboxService>(OutboxService);
    outboxRepository = module.get<Repository<Outbox>>(
      getRepositoryToken(Outbox)
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createEvent", () => {
    it("should create a new outbox event", async () => {
      const eventData: OutboxEvent = {
        eventType: "PROGRAM_CREATED",
        payload: { programId: 1 },
      };

      mockRepository.create.mockReturnValue(mockOutboxEvent);
      mockRepository.save.mockResolvedValue(mockOutboxEvent);

      await service.createEvent(eventData);

      expect(mockRepository.create).toHaveBeenCalledWith({
        eventType: eventData.eventType,
        payload: eventData.payload,
        processed: false,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockOutboxEvent);
    });
  });

  describe("createEventWithManager", () => {
    it("should create a new outbox event with entity manager", async () => {
      const eventData: OutboxEvent = {
        eventType: "PROGRAM_CREATED",
        payload: { programId: 1 },
      };

      const mockManager = {
        create: jest.fn().mockReturnValue(mockOutboxEvent),
        save: jest.fn().mockResolvedValue(mockOutboxEvent),
      } as unknown as EntityManager;

      await service.createEventWithManager(mockManager, eventData);

      expect(mockManager.create).toHaveBeenCalledWith(Outbox, {
        eventType: eventData.eventType,
        payload: eventData.payload,
        processed: false,
      });
      expect(mockManager.save).toHaveBeenCalledWith(Outbox, mockOutboxEvent);
    });
  });

  describe("getUnprocessedEvents", () => {
    it("should return unprocessed events", async () => {
      const mockEvents = [mockOutboxEvent];
      mockRepository.find.mockResolvedValue(mockEvents);

      const result = await service.getUnprocessedEvents(10);

      expect(result).toEqual(mockEvents);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { processed: false },
        order: { createdAt: "ASC" },
        take: 10,
      });
    });

    it("should use default limit when not provided", async () => {
      const mockEvents = [mockOutboxEvent];
      mockRepository.find.mockResolvedValue(mockEvents);

      await service.getUnprocessedEvents();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { processed: false },
        order: { createdAt: "ASC" },
        take: 100,
      });
    });
  });

  describe("markAsProcessed", () => {
    it("should mark event as processed", async () => {
      const eventId = 1;
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.markAsProcessed(eventId);

      expect(mockRepository.update).toHaveBeenCalledWith(eventId, {
        processed: true,
      });
    });
  });
});
