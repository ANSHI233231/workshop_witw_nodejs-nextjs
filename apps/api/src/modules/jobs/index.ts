import type { AccessGuard } from '../../core/http';

import type { JobsModuleDependencies, JobsTestDataModuleDependencies } from './contracts/jobs-module.contract';
import type { IJobTestDataService } from './contracts/job-test-data-service.contract';
import { JobController } from './controllers/job.controller';
import { JobRepository } from './repositories/job.repository';
import { JobTestDataRepository } from './repositories/job-test-data.repository';
import { createJobRouter } from './routes/job.routes';
import { JobCommandService } from './services/job-command.service';
import { JobFailureNotifier } from './services/job-failure-notifier';
import { JobService } from './services/job.service';
import { JobTestDataService } from './services/job-test-data.service';
import { JobWorker, type JobWorkerSettings } from './services/job-worker';

export type { IJobQueue } from './contracts/job-service.contract';
export type { JobsModuleDependencies } from './contracts/jobs-module.contract';
export type { JobEnqueueInput } from './dto/job.dto';
export type { JobWorkerSettings } from './services/job-worker';

export type { IJobTestDataService } from './contracts/job-test-data-service.contract';
export type { JobTestData, JobTestDataMarker } from './dto/job-test-data.dto';

export const createJobsTestDataModule = (dependencies: JobsTestDataModuleDependencies) => {
    const jobTestDataService: IJobTestDataService = new JobTestDataService(
        dependencies.db,
        new JobTestDataRepository(),
        dependencies.auditService,
        dependencies.isProduction,
    );
    return { jobTestDataService };
};

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
