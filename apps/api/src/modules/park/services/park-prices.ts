import type { IParkPriceSource } from '../contracts/park-price-source.contract';
import type { ParkPrice } from '../dto/park.dto';
import { NO_PRICE, toParkPrice } from '../mappers/park.mapper';

export class ParkPrices {
    private source: IParkPriceSource | null = null;

    connect(source: IParkPriceSource): void {
        this.source = source;
    }

    async of(masterParkIds: readonly number[]): Promise<ReadonlyMap<number, ParkPrice>> {
        if (!this.source) throw new Error('Park prices are not connected to the package module.');
        if (masterParkIds.length === 0) return new Map();
        const ranges = await this.source.priceRangesOfParks(masterParkIds);
        return new Map(ranges.map((range) => [range.masterParkId, toParkPrice(range)]));
    }

    async ofOne(masterParkId: number): Promise<ParkPrice> {
        return (await this.of([masterParkId])).get(masterParkId) ?? NO_PRICE;
    }
}

export const priceIn = (prices: ReadonlyMap<number, ParkPrice>, masterParkId: number): ParkPrice =>
    prices.get(masterParkId) ?? NO_PRICE;
