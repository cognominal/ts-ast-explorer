import { it, describe, before } from 'mocha';
import { expect } from 'chai';
import { getEnumBitFlags, nrOfBits, curateEnum, CuratedEnum } from "../utils";

// let nodeFlags : { [key: string]: string }

enum TestEnum {
    None = 0,
    Let = 1,
    Const = 3,
    Using = 4,
}

let curatedEnum: CuratedEnum

before(() => {
    curatedEnum = curateEnum(TestEnum);

});
describe('number of bits', () => {
    it('3 has 2 bits', () => {
        expect(nrOfBits(3)).to.equal(2)
    });
    it('0 has 0 bits', () => {
        expect(nrOfBits(0)).to.equal(0)
    });

});

describe('sortFlags', () => {
    it('None = 0', () => {
        expect(curatedEnum.zeroName).to.equal('None');
    })
    it('correct sort', () => {

        expect(curatedEnum.sortedEnumSymbols).to.deep.equal(['Const', 'Let', 'Using']);
    })

});

describe('getEnumBitFlags', () => {
    it('None = 0', () => {
        let flags = TestEnum.None;
        expect(getEnumBitFlags(flags, TestEnum)).to.equal('None');

    });
    it('Let = 1', () => {
        let flags = TestEnum.Let;
        expect(getEnumBitFlags(flags, TestEnum)).to.equal('Let');

    });
    it('Const = 3', () => {
        let flags = TestEnum.Const;
        expect(getEnumBitFlags(flags, TestEnum)).to.equal('Const');

    });
    it('Let Using = 5', () => {
        let flags = TestEnum.Let | TestEnum.Using;
        expect(getEnumBitFlags(flags, TestEnum)).to.equal('Let Using');

    });

});