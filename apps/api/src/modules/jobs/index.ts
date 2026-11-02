import type { AccessGuard } from '../../core/http';

import type { JobsModuleDependencies } from './contracts/jobs-module.contract';
import { JobController } from './controllers/job.controller';
import { JobRepository } from './repositories/job.repository';
import { createJobRouter } from './routes/job.routes';
import { JobCommandService } from './services/job-command.service';
import { JobFailureNotifier } from './services/job-failure-notifier';
import { JobService } from './services/job.service';
import { JobWorker, type JobWorkerSettings } from './services/job-worker';

export type { IJobQueue } from './contracts/job-service.contract';
export type { JobsModuleDependencies } from './contracts/jobs-module.contract';
export type { JobEnqueueInput } from './dto/job.dto';
export type { JobWorkerSettings } from './services/job-worker';

export const createJobsModule = (dependencies: JobsModuleDependencies) => {
    const { db, auditService, commandRunner } = dependencies;
    const repository = new JobRepository();
    const jobService = new JobService(
        db,
        repository,
        new JobCommandService(commandRunner),
        commandRunner,
        auditService,
    );
    return {
        jobQueue: jobService,
        createRouter: (superAdmin: AccessGuard) => createJobRouter(new JobController(jobService), superAdmin),
        createWorker: (settings: JobWorkerSettings) =>
            new JobWorker(
                db,
                repository,
                commandRunner,
                settings,
                new JobFailureNotifier(dependencies.notificationService, dependencies.usersService),
            ),
    };
};
