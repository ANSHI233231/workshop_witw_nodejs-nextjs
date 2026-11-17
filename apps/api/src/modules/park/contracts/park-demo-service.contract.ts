import type { DemoParkImage, ParkImageOutcome, ParkImageState } from '../dto/park-demo.dto';

export interface IParkDemoService {
    images(): Promise<ParkImageState[]>;
    addImages(images: readonly DemoParkImage[], actorId: number | null): Promise<ParkImageOutcome[]>;
    sampleImages(samples: readonly Buffer[]): Promise<ParkImageOutcome[]>;
    removeImages(images: readonly ParkImageOutcome[], actorId: number | null): Promise<number>;
}
