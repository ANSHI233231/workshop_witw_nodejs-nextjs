import type { Request, Response } from 'express';

import { created, noContent, ok, paginated } from '../../../core/http';
import { EXPORT_PAGE } from '../../../core/validation';
import type { IUsersService } from '../contracts/users-service.contract';
import { UserStatus, type UserStatusCode } from '../types/users.types';
import type {
    ListRolesQuery,
    ListUsersQuery,
    PickUsersQuery,
    SetUserPasswordBody,
    SetUserStatusBody,
    CreateUserBody,
    UpdateUserBody,
    UserIdParams,
} from '../validators/users.validators';

type SignedInUser = { readonly id: number };

const userFiltersOf = (query: ListUsersQuery) => ({
    search: query.search,
    status: query.status as UserStatusCode | undefined,
    metaRoleId: query.metaRoleId,
});

const signedInUserId = (res: Response): number => (res.locals['authUser'] as SignedInUser).id;

export class UsersController {
    constructor(private readonly usersService: IUsersService) {}

    summary = async (_req: Request, res: Response): Promise<void> => {
        ok(res, await this.usersService.summary());
    };

    pickUsers = async (req: Request, res: Response): Promise<void> => {
        const { search, page, limit } = req.query as unknown as PickUsersQuery;
        const result = await this.usersService.pickUsers(search, { page, limit });
        paginated(res, result.items, { page, limit, total: result.total });
    };

    listUsers = async (req: Request, res: Response): Promise<void> => {
        const query = req.query as unknown as ListUsersQuery;
        const result = await this.usersService.listUsers(userFiltersOf(query), {
            page: query.page,
            limit: query.limit,
        });
        paginated(res, result.items, { page: query.page, limit: query.limit, total: result.total });
    };

    exportUsers = async (req: Request, res: Response): Promise<void> => {
        const query = req.query as unknown as ListUsersQuery;
        ok(res, (await this.usersService.listUsers(userFiltersOf(query), EXPORT_PAGE)).items);
    };

    userDetail = async (req: Request, res: Response): Promise<void> => {
        ok(res, await this.usersService.userDetail((req.params as unknown as UserIdParams).id));
    };

    updateUser = async (req: Request, res: Response): Promise<void> => {
        const body = req.body as UpdateUserBody;
        const user = await this.usersService.updateUser(
            (req.params as unknown as UserIdParams).id,
            {
                name: body.name,
                username: body.username,
                email: body.email,
                mobile: body.mobile,
                systemRoleIds: body.systemRoleIds,
            },
            signedInUserId(res),
        );
        ok(res, user, `User "${user.name}" updated.`);
    };

    setStatus = async (req: Request, res: Response): Promise<void> => {
        const body = req.body as SetUserStatusBody;
        const user = await this.usersService.setStatus(
            (req.params as unknown as UserIdParams).id,
            body.status as UserStatusCode,
            signedInUserId(res),
        );
        ok(res, user, `User "${user.name}" marked ${body.status === UserStatus.ACTIVE ? 'active' : 'inactive'}.`);
    };

    createUser = async (req: Request, res: Response): Promise<void> => {
        const body = req.body as CreateUserBody;
        const user = await this.usersService.createAccount(
            {
                name: body.name,
                username: body.username,
                email: body.email,
                mobile: body.mobile,
                systemRoleIds: body.systemRoleIds,
                password: body.password,
            },
            signedInUserId(res),
        );
        created(res, user, `User "${user.name}" added.`);
    };

    setPassword = async (req: Request, res: Response): Promise<void> => {
        const body = req.body as SetUserPasswordBody;
        await this.usersService.setPassword(
            (req.params as unknown as UserIdParams).id,
            body.password,
            signedInUserId(res),
        );
        noContent(res);
    };

    listRoles = async (req: Request, res: Response): Promise<void> => {
        const { search, page, limit } = req.query as unknown as ListRolesQuery;
        const result = await this.usersService.listRoles({ search }, { page, limit });
        paginated(res, result.items, { page, limit, total: result.total });
    };
}
