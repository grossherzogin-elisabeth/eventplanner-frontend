import type { Position } from '@/app/types';

export interface PositionRepository {
    findAll(): Promise<Position[]>;
}
