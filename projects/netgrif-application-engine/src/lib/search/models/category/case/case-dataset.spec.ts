import {CaseDataset} from './case-dataset';
import {OperatorService} from '../../../operator-service/operator.service';
import {createMockDependencies} from '../../../../utility/tests/search-category-mock-dependencies';

describe('CaseDataset', () => {
    it('should create an instance', () => {
        const opService = new OperatorService();
        expect(new CaseDataset(opService, null, createMockDependencies())).toBeTruthy();
    });
});