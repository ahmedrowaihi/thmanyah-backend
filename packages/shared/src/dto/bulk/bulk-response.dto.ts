import { ApiProperty } from "@nestjs/swagger";

export class BulkCreateResponseDto {
  @ApiProperty({
    description: "Number of programs successfully created",
    example: 5,
  })
  created!: number;

  @ApiProperty({
    description: "Number of programs that failed to create",
    example: 1,
  })
  failed!: number;

  @ApiProperty({
    description: "Array of created programs",
    type: [Object],
  })
  programs!: any[];

  @ApiProperty({
    description: "Array of error messages for failed creations",
    type: [String],
    example: ["Program with title 'Introduction to AI' already exists"],
  })
  errors!: any[];
}

export class BulkDeleteResponseDto {
  @ApiProperty({
    description: "Number of programs successfully deleted",
    example: 3,
  })
  deleted!: number;

  @ApiProperty({
    description: "Number of programs that failed to delete",
    example: 1,
  })
  failed!: number;

  @ApiProperty({
    description: "Array of error messages for failed deletions",
    type: [String],
    example: ["Program with ID 5 not found"],
  })
  errors!: any[];
}
