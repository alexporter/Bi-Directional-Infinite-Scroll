describe('ScrollCtrl', function() {
    beforeEach(module('biDirectionalScroll'));
    
    var ctrl, scope;
    beforeEach(inject(function($controller, $rootScope) {
        scope = $rootScope.$new();
        
        ctrl = $controller('ScrollCtrl', {
            $scope: scope
        });
    }));
    
    it('should get array of attribute values from items based on array of attributes passed in', 
    function() {
        scope.items = [{ number: 1 }, { number: 2 }];
        var attrs = scope.getItemAttrs(['number']);
        expect(attrs).toEqual([1, 2]);
    });
    
    it('should get array of attribute values keyed by attribute from items based on array of attributes passed in', 
    function() {
        scope.items = [{ number: 1, other: 2 }, { number: 2, other: 3 }];
        var attrs = scope.getItemAttrs(['number', 'other']);
        expect(attrs).toEqual({ number: [1,2], other: [2,3]});
    });
    
    it('should get 1 from minimum and 3 for maximum out of array of numbers', 
    function() {
        scope.items = [{ number: 1 }, { number: 2 }, { number: 3 }];
        var min = scope.getMinItemNumber();
        expect(min).toEqual(1);
        var max = scope.getMaxItemNumber();
        expect(max).toEqual(3);
    });
    
    it('should get [2,3] from removing first array item', 
    function() {
        scope.items = [1,2,3];
        scope.removeItem(0);
        expect(scope.items).toEqual([2,3]);
    });
    
    
});

describe('ScrollItem', function()   {
    beforeEach(module('biDirectionalScroll'));
    
    var ScrollItem, $rootScope;
    
    beforeEach(inject(function(_ScrollItem_, _$rootScope_, $q)   {
        ScrollItem = _ScrollItem_;
        $rootScope = _$rootScope_;
        
        var deferred = $q.defer();
        deferred.resolve({ number: 1 });
        
        spyOn(ScrollItem, 'getItems').and.returnValue(deferred.promise);
    }));
    
    it('should have getDefaultText function', function()    {
        expect(angular.isFunction(ScrollItem.getDefaultText)).toBe(true);
    });
    
    it('should have getDefaultItem function', function()    {
        expect(angular.isFunction(ScrollItem.getDefaultItem)).toBe(true);
    });
    
    it('should have getItems function', function()    {
        expect(angular.isFunction(ScrollItem.getItems)).toBe(true);
    });
    
    it('getDefaultItem should return object', function()    {
        var item = ScrollItem.getDefaultItem({ number: 1 });
        expect(item).toEqual(jasmine.any(Object));
    });
    
    it('getItems should return promise and expect result object', function()    {
        var result;
        
        ScrollItem.getItems([{ number: 1 }]).then(function(returnFromPromise)   {
            result = returnFromPromise;
        });
        
        $rootScope.$apply();
        expect(result).toEqual(jasmine.any(Object));
    });
});