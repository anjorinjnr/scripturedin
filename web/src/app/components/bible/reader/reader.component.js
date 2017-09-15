import fullTemplate from './full-reader.html';
import popoverTemplate from './popover-reader.html';
import { ReaderController } from './reader-controller';
import './reader.css';

const bindings = {
    scriptureText: '<',
    scripture: '<'
};

const controller = ReaderController;


/**
 * This component renders a bible passage in full display.
 */
export const FullReaderComponent = {
    template: fullTemplate,
    bindings,
    controller
};

/**
 * This component renders a bible passage as a popover
 */
export const PopoverReaderComponent = {
    template: popoverTemplate,
    bindings,
    controller
};