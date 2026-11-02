import type { Request, Response } from 'express';

import { created, ok, paginated } from '../../../core/http';
import type { IJobService } from '../contracts/job-service.contract';
import { JobRunTrigger } from '../types/job.types';
import type {
    JobIdParams,
    JobScheduleBody,
    JobScheduleStatusBody,
    ListJobRunsQuery,
    ListJobSchedulesQuery,
    PreviewJobScheduleBody,
    RunJobCommandBody,
} from '../validators/job.validators';

type SignedInUser = { readonly id: number };

const actorOf = (res: Response): number => (res.locals['authUser'] as SignedInUser).id;

const idOf = (req: Request): number => (req.params as unknown as JobIdParams).id;

export class JobController {
    constructor(private readonly service: IJobService) {}

    commands = async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.commands());
    };

    serverTime = (_req: Request, res: Response): void => {
        ok(res, this.service.serverTime());
    };

    preview = (req: Request, res: Response): void => {
        ok(res, this.service.preview((req.body as PreviewJobScheduleBody).cronExpression));
    };

    schedules = async (req: Request, res: Response): Promise<void> => {
        const query = req.query as unknown as ListJobSchedulesQuery;
        const pagination = { page: query.page, limit: query.limit };
        const result = await this.service.schedules({ search: query.search, status: query.status }, pagination);
        paginated(res, result.items, { ...pagination, total: result.total });
    };

    addSchedule = async (req: Request, res: Response): Promise<void> => {
        const schedule = await this.service.addSchedule(req.body as JobScheduleBody, actorOf(res));
        created(res, schedule, `Scheduled job "${schedule.name}" added.`);
    };

    updateSchedule = async (req: Request, res: Response): Promise<void> => {
        const schedule = await this.service.updateSchedule(idOf(req), req.body as JobScheduleBody, actorOf(res));
        ok(res, schedule, `Scheduled job "${schedule.name}" saved.`);
    };

    setScheduleStatus = async (req: Request, res: Response): Promise<void> => {
        const body = req.body as JobScheduleStatusBody;
        ok(res, await this.service.setScheduleStatus(idOf(req), body.status, actorOf(res)));
    };

    runScheduleNow = async (req: Request, res: Response): Promise<void> => {
        created(
            res,
            await this.service.runScheduleNow(idOf(req), actorOf(res)),
            'The job will start in a few seconds.',
        );
    };

    runs = async (req: Request, res: Response): Promise<void> => {
        const query = req.query as unknown as ListJobRunsQuery;
        const pagination = { page: query.page, limit: query.limit };
        const result = await this.service.runs(
            {
                search: query.search,
                scheduleId: query.scheduleId,
                status: query.status,
                trigger: query.trigger,
                from: query.from,
                to: query.to,
                errorsOnly: query.errorsOnly,
                oneTime: query.oneTime,
            },
            pagination,
        );
        paginated(res, result.items, { ...pagination, total: result.total });
    };

    run = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.run(idOf(req)));
    };

    runCommand = async (req: Request, res: Response): Promise<void> => {
        const run = await this.service.runCommand(req.body as RunJobCommandBody, actorOf(res));
        created(
            res,
            run,
            run.trigger === JobRunTrigger.PLANNED ? 'The job is planned.' : 'The job will start in a few seconds.',
        );
    };

    cancelRun = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.cancelRun(idOf(req), actorOf(res)), 'The run was cancelled.');
    };

    terminateRun = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.service.terminateRun(idOf(req), actorOf(res)), 'The run was terminated.');
    };

    retryRun = async (req: Request, res: Response): Promise<void> => {
        created(
            res,
            await this.service.retryRun(idOf(req), actorOf(res)),
            'The job will start again in a few seconds.',
        );
    };
}
