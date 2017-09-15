import $ from 'jquery';
import angular from 'angular';

export const ShowScriptureOnChipClickDirective = ($compile, $sce, $timeout, bibleService) => {
    'ngInject';
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            console.log('link>>');
            let template = `
            <div>
                <div class="preloader pl-xs">
                    <svg class="pl-circular" viewBox="25 25 50 50">
                      <circle class="plc-path" cx="50" cy="50" r="20"></circle>
                    </svg>
                </div>
            </div>
            `;
            scope.$text = attrs.text;
            bibleService.getPassage(attrs.text).then(resp => {
                scope.$scripture = resp.data;
                let template = `
                <bible-reader-popover scripture="$scripture"> </bible-reader-popover>`;
                let popoverElement = $compile(angular.element(template))(scope);
                $timeout(() => {
                    scope.$scripturePopover = $sce.trustAsHtml(popoverElement.html());
                }, 100);
            });
            let popoverElement = $compile(angular.element(template))(scope);

            $timeout(() => {
                scope.$scripturePopover = $sce.trustAsHtml(popoverElement.html());
            }, 10);

        }
    }
};