import { type AccessGuard, type ApiRouter, apiRouter, asyncHandler } from '../../../core/http';
import { validate } from '../../../core/validation';
import type { JobController } from '../controllers/job.controller';
import {
    addJobScheduleSchema,
    jobRunIdSchema,
    jobScheduleIdSchema,
    listJobRunsSchema,
    listJobSchedulesSchema,
    previewJobScheduleSchema,
    runJobCommandSchema,
    setJobScheduleStatusSchema,
    updateJobScheduleSchema,
} from '../validators/job.validators';

export const createJobRouter = (controller: JobController, superAdmin: AccessGuard): ApiRouter => {
    const route = apiRouter();
    route.get('/commands', superAdmin, asyncHandler(controller.commands));
    route.get('/server-time', superAdmin, controller.serverTime);
    route.post('/schedules/preview', superAdmin, validate(previewJobScheduleSchema), controller.preview);
    route.get('/schedules', superAdmin, validate(listJobSchedulesSchema), asyncHandler(controller.schedules));
    route.post('/schedules', superAdmin, validate(addJobScheduleSchema), asyncHandler(controller.addSchedule));
    route.put('/schedules/:id', superAdmin, validate(updateJobScheduleSchema), asyncHandler(controller.updateSchedule));
    route.patch(
        '/schedules/:id/status',
        superAdmin,
        validate(setJobScheduleStatusSchema),
        asyncHandler(controller.setScheduleStatus),
    );
    route.post('/schedules/:id/run', superAdmin, validate(jobScheduleIdSchema), asyncHandler(controller.runScheduleNow));
    route.get('/runs', superAdmin, validate(listJobRunsSchema), asyncHandler(controller.runs));
    route.post('/runs', superAdmin, validate(runJobCommandSchema), asyncHandler(controller.runCommand));
    route.get('/runs/:id', superAdmin, validate(jobRunIdSchema), asyncHandler(controller.run));
    route.post('/runs/:id/cancel', superAdmin, validate(jobRunIdSchema), asyncHandler(controller.cancelRun));
    route.post('/runs/:id/terminate', superAdmin, validate(jobRunIdSchema), asyncHandler(controller.terminateRun));
    route.post('/runs/:id/retry', superAdmin, validate(jobRunIdSchema), asyncHandler(controller.retryRun));
    return route;
};
