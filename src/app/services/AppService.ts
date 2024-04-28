import type { I18nRepository } from '@/app/adapter';

export class AppService {
    private readonly i18nRepository: I18nRepository;

    constructor(params: { i18nRepository: I18nRepository }) {
        this.i18nRepository = params.i18nRepository;
    }

    public async initialize(): Promise<void> {
        await this.i18nRepository.loadMessages();
    }
}
