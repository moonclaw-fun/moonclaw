import { Controller, Get, Post, Body, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto, CreateUserResponseDto, UserBalanceResponseDto } from './dto/create-user.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new user',
    description: 'Create a new user with optional custom ID, username and initial balance'
  })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      'Basic User': {
        value: {
          username: 'john_doe',
        },
        description: 'Create user with default balance (1000)'
      },
      'User with Custom Balance': {
        value: {
          username: 'rich_user',
          balance: 5000,
        },
        description: 'Create user with custom balance'
      },
      'User with Custom ID': {
        value: {
          id: 'user_custom_123',
          username: 'custom_user',
          balance: 2000,
        },
        description: 'Create user with custom ID and balance'
      },
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User created successfully',
    type: CreateUserResponseDto,
    content: {
      'application/json': {
        example: {
          id: 'user_1',
          username: 'john_doe',
          balance: 1000,
          createdAt: '2024-01-15T08:30:00.000Z'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
  create(@Body() createUserDto: CreateUserDto): User {
    // If custom ID is provided, we need to handle it in the service
    if (createUserDto.id) {
      return this.userService.createWithId(createUserDto.id, createUserDto.username, createUserDto.balance);
    }
    return this.userService.create(createUserDto.username, createUserDto.balance);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all users',
    description: 'Retrieve a list of all registered users'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all users',
    type: [CreateUserResponseDto],
    content: {
      'application/json': {
        example: [
          {
            id: 'user_1',
            username: 'john_doe',
            balance: 1000,
            createdAt: '2024-01-15T08:30:00.000Z'
          },
          {
            id: 'user_2',
            username: 'jane_doe',
            balance: 2000,
            createdAt: '2024-01-15T09:00:00.000Z'
          }
        ]
      }
    }
  })
  findAll(): User[] {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their ID'
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'user_1',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User found',
    type: CreateUserResponseDto,
    content: {
      'application/json': {
        example: {
          id: 'user_1',
          username: 'john_doe',
          balance: 1000,
          createdAt: '2024-01-15T08:30:00.000Z'
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  findById(@Param('id') id: string): User | undefined {
    return this.userService.findById(id);
  }

  @Get(':id/balance')
  @ApiOperation({ 
    summary: 'Get user balance',
    description: 'Retrieve the current balance of a specific user'
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'user_1',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User balance retrieved successfully',
    type: UserBalanceResponseDto,
    content: {
      'application/json': {
        example: {
          balance: 1000
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  getBalance(@Param('id') id: string): UserBalanceResponseDto {
    return { balance: this.userService.getBalance(id) };
  }

  @Post(':id/token')
  @ApiOperation({
    summary: 'Generate access token',
    description: 'Generate or regenerate access token for a user'
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'user_1',
  })
  @ApiResponse({
    status: 200,
    description: 'Access token generated successfully',
    content: {
      'application/json': {
        example: {
          accessToken: 'ww_abc123xyz789',
          userId: 'user_1'
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  generateToken(@Param('id') id: string): { accessToken: string; userId: string } {
    const token = this.userService.generateAccessToken(id);
    return { accessToken: token, userId: id };
  }

  @Get('me/token')
  @ApiOperation({
    summary: 'Get user by access token',
    description: 'Get current user info using Authorization header with Bearer token'
  })
  @ApiResponse({
    status: 200,
    description: 'User found',
    content: {
      'application/json': {
        example: {
          id: 'user_1',
          username: 'john_doe',
          balance: 1000,
          createdAt: '2024-01-15T08:30:00.000Z'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiBearerAuth('access-token')
  getUserByToken(@Headers() headers: Record<string, string>): User {
    console.log('All headers:', headers);
    
    // Get authorization header (case-insensitive)
    const auth = headers['authorization'] || headers['Authorization'];
    
    if (!auth) {
      throw new UnauthorizedException('Authorization header required');
    }
    
    const token = auth.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Bearer token required');
    }
    
    const user = this.userService.findByAccessToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    
    return user;
  }
}
