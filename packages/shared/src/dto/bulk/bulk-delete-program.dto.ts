import { IsArray, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class BulkDeleteProgramDto {
  @ApiProperty({
    description: "Array of program IDs to delete",
    type: [Number],
    example: [1, 2, 3],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  ids!: number[];
}
