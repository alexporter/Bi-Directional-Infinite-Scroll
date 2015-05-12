var biDirectionalScroll = angular.module('biDirectionalScroll', []);

biDirectionalScroll.controller('ScrollCtrl', function($scope, ScrollItem)   {
    $scope.maxRows = 22;
    $scope.addTopThreshold = $scope.addBottomThreshold = 600;
    $scope.items = [];
    $scope.itemsToAdd = 1;
    $scope.colors = [
        '#28C6A6',
        '#5F5FDA',
        '#DC325D'
    ];
    $scope.loading = false;
    $scope.initialLoad = true;
    
    // Only change height after rendering is complete
    $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent, el) {
        if(!$scope.initialLoad) {
            var itemHeight = angular.element(el).outerHeight(),
                scrollPos = ($scope.scrollDir === 'down' ? -20 : 20) + $(window).scrollTop() + ($scope.scrollDir === 'down' ? -1 * $scope.lastRemovedHeight : itemHeight);
            $scope.loading = false;
            $scope.lastScrollTop = ($scope.scrollDir ==='down' ? scrollPos : scrollPos + 1); // Force the same scroll direction
            $(window).scrollTop(scrollPos);
        }
        if(ngRepeatFinishedEvent.targetScope.$last) $scope.initialLoad = false;
    });
    
    $scope.addItems = function(addType, removeIndex, numItems)   {
        if(typeof numItems !== 'number')    numItems = 1;
        $scope.loading = true;
        angular.element('.loader').css('top', ($scope.scrollDir === 'down' ? 'inherit' : '5px'));
        angular.element('.loader').css('bottom', ($scope.scrollDir === 'down' ? '5px' : 'inherit'));
        angular.element('.loader').css('display', 'block');
        var itemNumber = 1,
            item,
            itemNumbers = [];
        
        if($scope.items.length)  {
            if(addType === 'prepend')   {
                var min = $scope.getMinItemNumber();
                if(min == 1) {
                    angular.element('.loader').css('display', 'none');
                    $scope.loading = false;
                    return;
                }
                else    {
                    for(var i=1; i<=numItems; i++)   {
                        itemNumber = min - i;
                        if(itemNumber >= 1) itemNumbers.push(itemNumber); // Only add items if the itemNumber is greater than one
                    }
                }
            }
            else    {
                var max = $scope.getMaxItemNumber();
                addPos = $scope.items.length;
                for(var i=1; i<=numItems; i++)   {
                    itemNumber = max + i;
                    itemNumbers.push(itemNumber);
                }
            }
        }
        
        $scope.getItems(itemNumbers, function(items) {
            angular.forEach(items, function(item, k)   {
                $scope.lastRemovedHeight = angular.element('[item-number=' + $scope.items[(removeIndex === -1 ? ($scope.items.length -1) : 0)].number + ']').outerHeight();
                $scope.removeItem(removeIndex);
                $scope.items.splice(($scope.scrollDir === 'down' ? $scope.items.length : 0), 0, item);
                angular.element('.loader').css('display', 'none');
            });
        });
    }
    
    $scope.removeItem = function(index)  {
        $scope.items.splice(index, 1);
    }
    
    $scope.getItems = function(nums, successFn, skipDelay)    {
        var configs = [],
            defaultText = ScrollItem.getDefaultText(),
            text = [],
            rand = Math.floor((Math.random() * 4) + 1);
        
        for(var i=0; i<rand; i++)   {
            text.push(defaultText);
        }
        angular.forEach(nums, function(num) {
            configs.push({ number: num, color: $scope.colors[(num - 1) % $scope.colors.length], text: text.join(' ') });
        });
        ScrollItem.getItems(configs, skipDelay)
        .then(successFn);
    }
    
    $scope.getMinItemNumber = function()  {
        return Math.min.apply(Math, $scope.getItemAttrs(['number']));
    }
    
    $scope.getMaxItemNumber = function()  {
        return Math.max.apply(Math, $scope.getItemAttrs(['number']));
    }
    
    $scope.getItemAttrs = function(attrs)    {
        var attrInfo = {};
        
        angular.forEach(attrs, function(attr)   {
            if(!attrInfo[attr])    attrInfo[attr] = [];
            angular.forEach($scope.items, function(item)   {
                attrInfo[attr].push(item[attr]);
            });
        });
        
        return (attrs.length === 1 ? attrInfo[attrs[0]] : attrInfo);
    }
    
    var nums = [];
    for(var i=0; i<$scope.maxRows; i++) {
        nums.push(i + 1);
    }
    $scope.getItems(nums, function(items)   {
        $scope.items = items;
    }, true); // Skip the simulated delay for the initial load
});

biDirectionalScroll.directive('scroll', function($window)  {
    // Handle item heights/positioning using jQuery
    return function(scope, element, attrs)  {
        angular.element($window).bind('scroll', function()  {
            if(typeof scope.lastScrollTop === 'undefined')    scope.lastScrollTop = 0;
            var fullHeight = $('body').height(),
                viewportTop = $(window).scrollTop(),
                viewportBottom = viewportTop + $(window).height(),
                viewportHeight = viewportBottom - viewportTop,
                fromBottom = (fullHeight - viewportBottom);
            
            // Handle case where thresholds are too tall for full height
            if(scope.addBottomThreshold > fullHeight) {
                scope.addBottomThreshold = fullHeight * 0.9;
            }
            if(scope.addTopThreshold > fullHeight) {
                scope.addTopThreshold = fullHeight * 0.9;
            }
            
            if(!scope.loading)  {
                scope.scrollDir = (scope.lastScrollTop > viewportTop ? 'up' : 'down');
                if(scope.scrollDir === 'down' && fromBottom <= scope.addBottomThreshold)    {
                    scope.addItems('append', 0, scope.itemsToAdd);
                }
                else if(scope.scrollDir === 'up' && viewportTop <= scope.addTopThreshold)   {
                    scope.addItems('prepend', -1, scope.itemsToAdd);
                }
            }
            
            scope.lastScrollTop = viewportTop;
            
            // This was making items that scroll just out of view opaque
            /*$('li').each(function(k, item) {
                var itemTop = $(item).offset().top,
                    itemHeight = $(item).outerHeight(),
                    goingOffTop = (scope.scrollDir === 'down' ? (itemTop < viewportTop && (itemTop + itemHeight) > viewportTop) : false), // Check if item has begun to go off the top of the viewport (if scrolling down)
                    goingOffBottom = (scope.scrollDir === 'up' ? (itemTop < viewportBottom && (itemTop + itemHeight) > viewportBottom) : false), // Check if item has begun to go off the bottom of the viewport (if scrolling up)
                    opacity = 1,
                    minOpacity = 0.05; // Minimum opacity allowed for items scrolling out of view

                // If item is going off of top or bottom then determine what percent has gone off 
                // and adjust opacity as a percent down to the minimum opacity
                if(goingOffTop || goingOffBottom) {
                    var percentOff;
                    if(goingOffTop) {
                        percentOff = (viewportTop - itemTop) / itemHeight;
                    }
                    else    {
                        percentOff = ((itemTop + itemHeight) - viewportBottom) / itemHeight;
                    }

                    opacity = minOpacity + (1 - percentOff) * (1 - minOpacity);
                }
                $(item).css({ 'opacity': opacity });
            });*/
            
            scope.$apply();
        });
    };
});

biDirectionalScroll.directive('onFinishRender', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attr)    {
            $timeout(function() {
                scope.$emit('ngRepeatFinished', element);
            });
        }
    }
});

biDirectionalScroll.factory('ScrollItem', function($q, $timeout)  {
    return {
        getDefaultText: function()  {
            return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
        },
        getDefaultItem: function(config)   {
            return angular.extend({
                title: 'Item #' + (typeof config === 'object' && config.number ? config.number: 'N/A'),
                text: this.getDefaultText(),
                date: (new Date())
            }, config);
        },
        getItems: function(configs, skipDelay)  {
            var me = this,
                deferred = $q.defer();
            
            // Simulate ajax call
            $timeout(function() {
                var items = [];
                angular.forEach(configs, function(config)   {
                    items.push(me.getDefaultItem(config));
                });
                deferred.resolve(items);
            }, (skipDelay ? 0 : 300));
            
            return deferred.promise;
        }
    }
});