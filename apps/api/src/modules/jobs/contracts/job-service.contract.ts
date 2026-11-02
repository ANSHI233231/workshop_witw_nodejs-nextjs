import type { PaginationQuery } from '../../../core/validation';
import type {
    JobCommandDto,
    JobEnqueueInput,
    JobPage,
    JobRunCommandInput,
    JobRunDetailDto,
    JobRunDto,
    JobRunFilters,
    JobScheduleDto,
    JobScheduleFilters,
    JobScheduleInput,
    JobSchedulePreviewDto,
    JobServerTimeDto,
} from '../dto/job.dto';

export interface IJobQueue {
    enqueue(input: JobEnqueueInput): Promise<number | null>;
}

export interface IJobService extends IJobQueue {
    commands(): Promise<readonly JobCommandDto[]>;
    serverTime(): JobServerTimeDto;
    preview(cronExpression: string): JobSchedulePreviewDto;
    schedules(filters: JobScheduleFilters, pagination: PaginationQuery): Promise<JobPage<JobScheduleDto>>;
    addSchedule(input: JobScheduleInput, actorId: number): Promise<JobScheduleDto>;
    updateSchedule(id: number, input: JobScheduleInput, actorId: number): Promise<JobScheduleDto>;
    setScheduleStatus(id: number, status: number, actorId: number): Promise<JobScheduleDto>;
    runScheduleNow(id: number, actorId: number): Promise<JobRunDetailDto>;
    runs(filters: JobRunFilters, pagination: PaginationQuery): Promise<JobPage<JobRunDto>>;
    run(id: number): Promise<JobRunDetailDto>;
    runCommand(input: JobRunCommandInput, actorId: number): Promise<JobRunDetailDto>;
    cancelRun(id: number, actorId: number): Promise<JobRunDetailDto>;
    terminateRun(id: number, actorId: number): Promise<JobRunDetailDto>;
    retryRun(id: number, actorId: number): Promise<JobRunDetailDto>;
}
