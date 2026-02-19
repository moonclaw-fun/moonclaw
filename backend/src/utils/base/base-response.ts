import { ApiResponseProperty } from '@nestjs/swagger';

export class BaseResponse {
  @ApiResponseProperty({ type: Number })
  id: number;

  @ApiResponseProperty({ type: Date })
  created_at: Date;

  @ApiResponseProperty({ type: Date })
  updated_at: Date;
}

export class BaseResponseWithoutId {
  @ApiResponseProperty({ type: Date })
  created_at: Date;

  @ApiResponseProperty({ type: Date })
  updated_at: Date;
}

export class BasePaginationResponse {
  @ApiResponseProperty({ type: Number })
  total: number;

  @ApiResponseProperty({ type: Number })
  page: number;

  @ApiResponseProperty({ type: Number })
  pageSize: number;
}
