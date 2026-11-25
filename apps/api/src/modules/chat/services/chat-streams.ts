import type { EventStream } from '../../../core/http';

export class ChatStreams {
    private readonly byUser = new Map<number, Set<EventStream>>();

    add(userId: number, stream: EventStream): void {
        const streams = this.byUser.get(userId) ?? new Set<EventStream>();
        streams.add(stream);
        this.byUser.set(userId, streams);
        stream.onClose(() => {
            streams.delete(stream);
            if (streams.size === 0 && this.byUser.get(userId) === streams) this.byUser.delete(userId);
        });
    }

    publish(userId: number, event: string, data: unknown): void {
        for (const stream of this.byUser.get(userId) ?? []) stream.send(event, data);
    }

    hasStreams(userId: number): boolean {
        return (this.byUser.get(userId)?.size ?? 0) > 0;
    }
}
