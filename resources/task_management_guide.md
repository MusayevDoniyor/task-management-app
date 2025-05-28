# Task Management App - To'liq Loyiha Qo'llanmasi

## 📋 Loyiha Haqida

Bu loyiha zamonaviy **Task Management Application** bo'lib, jamoa uchun vazifalarni boshqarish, real-time hamkorlik va ko'p turdagi autentifikatsiya imkoniyatlarini taqdim etadi.

---

## 🛠 Texnologiya Stack

### Backend

- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **OAuth**: Google Auth, GitHub Auth
- **API**: REST + GraphQL (Apollo Server)
- **Real-time**: WebSocket
- **Caching**: Redis
- **File Upload**: Multer
- **Validation**: class-validator, class-transformer

### DevOps

- **Containerization**: Docker + Docker Compose
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Environment**: dotenv

---

## 🏗 Loyiha Strukturasi

```
task-management-app/
├── src/
│   ├── auth/                 # Authentication module
│   │   ├── strategies/       # Passport strategies
│   │   ├── guards/          # Auth guards
│   │   └── decorators/      # Custom decorators
│   ├── users/               # User management
│   ├── tasks/               # Task CRUD operations
│   ├── projects/            # Project management
│   ├── teams/               # Team collaboration
│   ├── categories/          # Task categories
│   ├── files/               # File upload handling
│   ├── notifications/       # Real-time notifications
│   ├── common/              # Shared utilities
│   │   ├── guards/          # Common guards
│   │   ├── interceptors/    # Response interceptors
│   │   ├── pipes/           # Validation pipes
│   │   └── filters/         # Exception filters
│   ├── prisma/              # Database schema
│   └── graphql/             # GraphQL schema
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── docker-compose.yml       # Development environment
├── Dockerfile              # Production container
└── README.md               # Project documentation
```

---

## 🗄 Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  username    String?  @unique
  firstName   String?
  lastName    String?
  avatar      String?
  provider    AuthProvider @default(LOCAL)
  providerId  String?
  password    String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  ownedTeams    Team[]     @relation("TeamOwner")
  teamMembers   TeamMember[]
  createdTasks  Task[]     @relation("TaskCreator")
  assignedTasks Task[]     @relation("TaskAssignee")
  comments      Comment[]
  activities    Activity[]

  @@map("users")
}

model Team {
  id        String   @id @default(cuid())
  name      String
  description String?
  avatar    String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  owner    User   @relation("TeamOwner", fields: [ownerId], references: [id])
  ownerId  String
  members  TeamMember[]
  projects Project[]

  @@map("teams")
}

model TeamMember {
  id       String     @id @default(cuid())
  role     TeamRole   @default(MEMBER)
  joinedAt DateTime   @default(now())

  // Relations
  user   User   @relation(fields: [userId], references: [id])
  userId String
  team   Team   @relation(fields: [teamId], references: [id])
  teamId String

  @@unique([userId, teamId])
  @@map("team_members")
}

model Project {
  id          String        @id @default(cuid())
  name        String
  description String?
  color       String?
  status      ProjectStatus @default(ACTIVE)
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  // Relations
  team   Team   @relation(fields: [teamId], references: [id])
  teamId String
  tasks  Task[]

  @@map("projects")
}

model Category {
  id        String   @id @default(cuid())
  name      String
  color     String
  icon      String?
  createdAt DateTime @default(now())

  // Relations
  tasks Task[]

  @@map("categories")
}

model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  dueDate     DateTime?
  estimatedHours Int?
  actualHours    Int?
  tags        String[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  // Relations
  creator     User      @relation("TaskCreator", fields: [creatorId], references: [id])
  creatorId   String
  assignee    User?     @relation("TaskAssignee", fields: [assigneeId], references: [id])
  assigneeId  String?
  project     Project   @relation(fields: [projectId], references: [id])
  projectId   String
  category    Category? @relation(fields: [categoryId], references: [id])
  categoryId  String?

  comments    Comment[]
  attachments Attachment[]
  activities  Activity[]

  @@map("tasks")
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  author User   @relation(fields: [authorId], references: [id])
  authorId String
  task   Task   @relation(fields: [taskId], references: [id])
  taskId String

  @@map("comments")
}

model Attachment {
  id         String   @id @default(cuid())
  filename   String
  originalName String
  mimeType   String
  size       Int
  url        String
  uploadedAt DateTime @default(now())

  // Relations
  task   Task   @relation(fields: [taskId], references: [id])
  taskId String

  @@map("attachments")
}

model Activity {
  id        String       @id @default(cuid())
  action    ActivityType
  details   Json?
  createdAt DateTime     @default(now())

  // Relations
  user   User   @relation(fields: [userId], references: [id])
  userId String
  task   Task?  @relation(fields: [taskId], references: [id])
  taskId String?

  @@map("activities")
}

// Enums
enum AuthProvider {
  LOCAL
  GOOGLE
  GITHUB
}

enum TeamRole {
  OWNER
  ADMIN
  MEMBER
}

enum ProjectStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum ActivityType {
  TASK_CREATED
  TASK_UPDATED
  TASK_ASSIGNED
  TASK_COMPLETED
  COMMENT_ADDED
  ATTACHMENT_UPLOADED
}
```

---

## 🔐 Authentication Implementation

### JWT Strategy

```typescript
// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
    };
  }
}
```

### Google OAuth Strategy

```typescript
// src/auth/strategies/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: '/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    const user = {
      provider: 'GOOGLE',
      providerId: id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      avatar: photos[0].value,
    };
    done(null, user);
  }
}
```

### GitHub OAuth Strategy

```typescript
// src/auth/strategies/github.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: '/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { id, username, emails, photos } = profile;
    return {
      provider: 'GITHUB',
      providerId: id,
      username,
      email: emails?.[0]?.value,
      avatar: photos?.[0]?.value,
    };
  }
}
```

---

## 🚀 API Endpoints

### Authentication Endpoints

```
POST   /auth/register          # Local registration
POST   /auth/login             # Local login
GET    /auth/google            # Google OAuth
GET    /auth/google/callback   # Google callback
GET    /auth/github            # GitHub OAuth
GET    /auth/github/callback   # GitHub callback
POST   /auth/refresh           # Refresh token
POST   /auth/logout            # Logout
```

### User Management

```
GET    /users/profile          # Get current user
PUT    /users/profile          # Update profile
POST   /users/upload-avatar    # Upload avatar
GET    /users/:id              # Get user by ID
```

### Team Management

```
GET    /teams                  # Get user teams
POST   /teams                  # Create team
GET    /teams/:id              # Get team details
PUT    /teams/:id              # Update team
DELETE /teams/:id              # Delete team
POST   /teams/:id/members      # Add team member
DELETE /teams/:id/members/:userId # Remove member
PUT    /teams/:id/members/:userId # Update member role
```

### Project Management

```
GET    /projects               # Get projects
POST   /projects               # Create project
GET    /projects/:id           # Get project details
PUT    /projects/:id           # Update project
DELETE /projects/:id           # Delete project
GET    /projects/:id/tasks     # Get project tasks
```

### Task Management

```
GET    /tasks                  # Get tasks (with filters)
POST   /tasks                  # Create task
GET    /tasks/:id              # Get task details
PUT    /tasks/:id              # Update task
DELETE /tasks/:id              # Delete task
POST   /tasks/:id/assign       # Assign task
POST   /tasks/:id/comments     # Add comment
GET    /tasks/:id/comments     # Get comments
POST   /tasks/:id/attachments  # Upload attachment
GET    /tasks/:id/activities   # Get task activities
```

### Categories

```
GET    /categories             # Get categories
POST   /categories             # Create category
PUT    /categories/:id         # Update category
DELETE /categories/:id         # Delete category
```

---

## 📊 GraphQL Schema

```graphql
# src/graphql/schema.gql

type User {
  id: ID!
  email: String!
  username: String
  firstName: String
  lastName: String
  avatar: String
  isActive: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!

  ownedTeams: [Team!]!
  teamMembers: [TeamMember!]!
  createdTasks: [Task!]!
  assignedTasks: [Task!]!
}

type Team {
  id: ID!
  name: String!
  description: String
  avatar: String
  isActive: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!

  owner: User!
  members: [TeamMember!]!
  projects: [Project!]!
}

type Project {
  id: ID!
  name: String!
  description: String
  color: String
  status: ProjectStatus!
  startDate: DateTime
  endDate: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!

  team: Team!
  tasks: [Task!]!
}

type Task {
  id: ID!
  title: String!
  description: String
  status: TaskStatus!
  priority: Priority!
  dueDate: DateTime
  estimatedHours: Int
  actualHours: Int
  tags: [String!]!
  createdAt: DateTime!
  updatedAt: DateTime!

  creator: User!
  assignee: User
  project: Project!
  category: Category
  comments: [Comment!]!
  attachments: [Attachment!]!
}

# Queries
type Query {
  me: User!
  users: [User!]!
  teams: [Team!]!
  team(id: ID!): Team
  projects: [Project!]!
  project(id: ID!): Project
  tasks(filter: TaskFilter): [Task!]!
  task(id: ID!): Task
  categories: [Category!]!
}

# Mutations
type Mutation {
  # User mutations
  updateProfile(input: UpdateProfileInput!): User!

  # Team mutations
  createTeam(input: CreateTeamInput!): Team!
  updateTeam(id: ID!, input: UpdateTeamInput!): Team!
  deleteTeam(id: ID!): Boolean!
  addTeamMember(teamId: ID!, userId: ID!, role: TeamRole!): TeamMember!

  # Project mutations
  createProject(input: CreateProjectInput!): Project!
  updateProject(id: ID!, input: UpdateProjectInput!): Project!
  deleteProject(id: ID!): Boolean!

  # Task mutations
  createTask(input: CreateTaskInput!): Task!
  updateTask(id: ID!, input: UpdateTaskInput!): Task!
  deleteTask(id: ID!): Boolean!
  assignTask(taskId: ID!, assigneeId: ID!): Task!
  addComment(taskId: ID!, content: String!): Comment!
}

# Subscriptions
type Subscription {
  taskUpdated(projectId: ID!): Task!
  teamUpdated(teamId: ID!): Team!
  newComment(taskId: ID!): Comment!
}

# Input Types
input TaskFilter {
  status: TaskStatus
  priority: Priority
  assigneeId: ID
  projectId: ID
  categoryId: ID
  search: String
  dueDateFrom: DateTime
  dueDateTo: DateTime
}

input CreateTaskInput {
  title: String!
  description: String
  priority: Priority = MEDIUM
  dueDate: DateTime
  estimatedHours: Int
  tags: [String!] = []
  projectId: ID!
  categoryId: ID
  assigneeId: ID
}

# Enums
enum TaskStatus {
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum ProjectStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
}

enum TeamRole {
  OWNER
  ADMIN
  MEMBER
}

scalar DateTime
```

---

## 🔧 Core Services Implementation

### Task Service

```typescript
// src/tasks/tasks.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto } from './dto';
import { User } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, user: User) {
    // Verify user has access to the project
    const project = await this.prisma.project.findFirst({
      where: {
        id: createTaskDto.projectId,
        team: {
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
      },
    });

    if (!project) {
      throw new ForbiddenException('Access denied to this project');
    }

    const task = await this.prisma.task.create({
      data: {
        ...createTaskDto,
        creatorId: user.id,
      },
      include: {
        creator: true,
        assignee: true,
        project: true,
        category: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'desc' },
        },
        attachments: true,
      },
    });

    // Log activity
    await this.prisma.activity.create({
      data: {
        action: 'TASK_CREATED',
        userId: user.id,
        taskId: task.id,
        details: { taskTitle: task.title },
      },
    });

    return task;
  }

  async findAll(filter: TaskFilterDto, user: User) {
    const where: any = {
      project: {
        team: {
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
      },
    };

    // Apply filters
    if (filter.status) where.status = filter.status;
    if (filter.priority) where.priority = filter.priority;
    if (filter.assigneeId) where.assigneeId = filter.assigneeId;
    if (filter.projectId) where.projectId = filter.projectId;
    if (filter.categoryId) where.categoryId = filter.categoryId;
    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    if (filter.dueDateFrom || filter.dueDateTo) {
      where.dueDate = {};
      if (filter.dueDateFrom) where.dueDate.gte = filter.dueDateFrom;
      if (filter.dueDateTo) where.dueDate.lte = filter.dueDateTo;
    }

    return this.prisma.task.findMany({
      where,
      include: {
        creator: true,
        assignee: true,
        project: true,
        category: true,
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string, user: User) {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        project: {
          team: {
            OR: [
              { ownerId: user.id },
              { members: { some: { userId: user.id } } },
            ],
          },
        },
      },
      include: {
        creator: true,
        assignee: true,
        project: {
          include: { team: true },
        },
        category: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'desc' },
        },
        attachments: true,
        activities: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: User) {
    const existingTask = await this.findOne(id, user);

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
      include: {
        creator: true,
        assignee: true,
        project: true,
        category: true,
      },
    });

    // Log activity
    await this.prisma.activity.create({
      data: {
        action: 'TASK_UPDATED',
        userId: user.id,
        taskId: id,
        details: {
          changes: updateTaskDto,
          taskTitle: updatedTask.title,
        },
      },
    });

    return updatedTask;
  }

  async assign(taskId: string, assigneeId: string, user: User) {
    const task = await this.findOne(taskId, user);

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: { assigneeId },
      include: {
        creator: true,
        assignee: true,
        project: true,
      },
    });

    // Log activity
    await this.prisma.activity.create({
      data: {
        action: 'TASK_ASSIGNED',
        userId: user.id,
        taskId,
        details: {
          assigneeId,
          taskTitle: updatedTask.title,
        },
      },
    });

    return updatedTask;
  }

  async addComment(taskId: string, content: string, user: User) {
    const task = await this.findOne(taskId, user);

    const comment = await this.prisma.comment.create({
      data: {
        content,
        authorId: user.id,
        taskId,
      },
      include: {
        author: true,
      },
    });

    // Log activity
    await this.prisma.activity.create({
      data: {
        action: 'COMMENT_ADDED',
        userId: user.id,
        taskId,
        details: {
          commentId: comment.id,
          taskTitle: task.title,
        },
      },
    });

    return comment;
  }

  async remove(id: string, user: User) {
    const task = await this.findOne(id, user);

    await this.prisma.task.delete({
      where: { id },
    });

    return { message: 'Task deleted successfully' };
  }
}
```

---

## 🔄 Real-time Implementation

### WebSocket Gateway

```typescript
// src/notifications/notifications.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Socket>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove from user sockets map
    for (const [userId, socket] of this.userSockets.entries()) {
      if (socket.id === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; projectId?: string },
  ) {
    this.userSockets.set(data.userId, client);

    if (data.projectId) {
      client.join(`project:${data.projectId}`);
    }

    client.emit('joined', { message: 'Successfully joined' });
  }

  @SubscribeMessage('leave')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    client.leave(`project:${data.projectId}`);
  }

  // Emit to specific user
  emitToUser(userId: string, event: string, data: any) {
    const socket = this.userSockets.get(userId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  // Emit to project room
  emitToProject(projectId: string, event: string, data: any) {
    this.server.to(`project:${projectId}`).emit(event, data);
  }

  // Emit task updates
  emitTaskUpdate(task: any) {
    this.emitToProject(task.projectId, 'taskUpdated', task);

    // Notify assigned user
    if (task.assigneeId) {
      this.emitToUser(task.assigneeId, 'taskAssigned', task);
    }
  }

  // Emit new comment
  emitNewComment(comment: any, taskId: string, projectId: string) {
    this.emitToProject(projectId, 'newComment', { comment, taskId });
  }
}
```

---

## 📁 File Upload Implementation

### File Service

```typescript
// src/files/files.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class FilesService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async uploadTaskAttachment(
    file: Express.Multer.File,
    taskId: string,
    userId: string,
  ) {
    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }

    // Generate unique filename
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    const uploadPath = path.join(process.cwd(), 'uploads', 'attachments');

    // Ensure directory exists
    await fs.mkdir(uploadPath, { recursive: true });

    // Save file
    const filePath = path.join(uploadPath, filename);
    await fs.writeFile(filePath, file.buffer);

    // Save to database
    const attachment = await this.prisma.attachment.create({
      data: {
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/attachments/${filename}`,
        taskId,
      },
    });

    // Log activity
    await this.prisma.activity.create({
      data: {
        action: 'ATTACHMENT_UPLOADED',
        userId,
        taskId,
        details: {
          filename: file.originalname,
          attachmentId: attachment.id,
        },
      },
    });

    return attachment;
  }

  async deleteAttachment(attachmentId: string, userId: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { task: true },
    });

    if (!attachment) {
      throw new BadRequestException('Attachment not found');
    }

    // Delete file from disk
    const filePath = path.join(
      process.cwd(),
      'uploads',
      'attachments',
      attachment.filename,
    );
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    // Delete from database
    await this.prisma.attachment.delete({
      where: { id: attachmentId },
    });

    return { message: 'Attachment deleted successfully' };
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests Example

```typescript
// src/tasks/tasks.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.
```
