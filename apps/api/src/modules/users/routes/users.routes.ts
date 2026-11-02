import { type AccessGuard, type ApiRouter, apiRouter, asyncHandler } from '../../../core/http';
import { validate } from '../../../core/validation';
import type { UsersController } from '../controllers/users.controller';
import {
    listRolesSchema,
    listUsersSchema,
    pickUsersSchema,
    setUserPasswordSchema,
    updateUserSchema,
    createUserSchema,
    setUserStatusSchema,
    userIdParamsSchema,
} from '../validators/users.validators';

export type UsersGuards = {
    readonly users: AccessGuard;
    readonly roles: AccessGuard;
    readonly picker: AccessGuard;
};

export const createUsersRouter = (usersController: UsersController, guards: UsersGuards): ApiRouter => {
    const route = apiRouter();

    route.get('/summary', guards.users, asyncHandler(usersController.summary));
    route.get('/picker', guards.picker, validate(pickUsersSchema), asyncHandler(usersController.pickUsers));
    route.get('/', guards.users, validate(listUsersSchema), asyncHandler(usersController.listUsers));
    route.get('/export', guards.users, validate(listUsersSchema), asyncHandler(usersController.exportUsers));
    route.get('/roles', guards.roles, validate(listRolesSchema), asyncHandler(usersController.listRoles));
    route.get('/:id', guards.users, validate(userIdParamsSchema), asyncHandler(usersController.userDetail));
    route.post('/', guards.users, validate(createUserSchema), asyncHandler(usersController.createUser));
    route.patch('/:id', guards.users, validate(updateUserSchema), asyncHandler(usersController.updateUser));
    route.patch('/:id/status', guards.users, validate(setUserStatusSchema), asyncHandler(usersController.setStatus));
    route.post(
        '/:id/password',
        guards.users,
        validate(setUserPasswordSchema),
        asyncHandler(usersController.setPassword),
    );

    return route;
};
