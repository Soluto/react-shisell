import * as React from 'react';
import * as renderer from 'react-test-renderer';
import doOnFirstProps from './doOnFirstProps';

describe('doOnFirstProps', () => {
    const Empty = () => null;

    it('Should not execute if predicate is never true', () => {
        const onFirstProps = jest.fn();
        const Component = doOnFirstProps(() => false, onFirstProps)(Empty);

        const result = renderer.create(<Component />);
        for (let a = 0; a < 50; a++) {
            result.update(<Component num={a} />);
        }

        expect(onFirstProps).not.toBeCalled();
    });

    it('Should execute if predicate is true, but only once', () => {
        const onFirstProps = jest.fn();
        const predicate = ({ num }: { num: number }) => num >= 2;
        const Component = doOnFirstProps(predicate, onFirstProps)(Empty);

        const result = renderer.create(<Component />);
        for (let a = 0; a < 5; a++) {
            result.update(<Component num={a} />);
        }

        expect(onFirstProps).toBeCalledWith({ num: 2 });
    });
});
