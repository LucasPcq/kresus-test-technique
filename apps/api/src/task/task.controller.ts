import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import {
	type BatchDeleteDto,
	type CreateTaskDto,
	type JwtPayload,
	type TaskQueryDto,
	type UpdateTaskDto,
	batchDeleteSchema,
	createTaskSchema,
	taskQuerySchema,
	updateTaskSchema,
} from "@kresus/contract";

import { CurrentUser } from "../common/decorators/current-user.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";

import { ApiBatchDeleteTasks, ApiCreateTask, ApiDeleteTask, ApiFindAllTasks, ApiUpdateTask } from "./task.swagger";
import { TaskService } from "./task.service";

@ApiTags("tasks")
@Controller("tasks")
export class TaskController {
	constructor(private readonly taskService: TaskService) {}

	@Get()
	@ApiFindAllTasks()
	findAll(
		@Query(new ZodValidationPipe(taskQuerySchema)) query: TaskQueryDto,
		@CurrentUser() user: JwtPayload,
	) {
		return this.taskService.findAll(query, user.sub);
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@ApiCreateTask()
	create(
		@Body(new ZodValidationPipe(createTaskSchema)) dto: CreateTaskDto,
		@CurrentUser() user: JwtPayload,
	) {
		return this.taskService.create(dto, user.sub);
	}

	@Post("batch-delete")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiBatchDeleteTasks()
	batchDelete(
		@Body(new ZodValidationPipe(batchDeleteSchema)) { ids }: BatchDeleteDto,
		@CurrentUser() user: JwtPayload,
	) {
		return this.taskService.batchDelete(ids, user.sub);
	}

	@Patch(":id")
	@ApiUpdateTask()
	update(
		@Param("id", ParseUUIDPipe) id: string,
		@Body(new ZodValidationPipe(updateTaskSchema)) dto: UpdateTaskDto,
		@CurrentUser() user: JwtPayload,
	) {
		return this.taskService.update(id, dto, user.sub);
	}

	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiDeleteTask()
	remove(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
		return this.taskService.delete(id, user.sub);
	}
}
