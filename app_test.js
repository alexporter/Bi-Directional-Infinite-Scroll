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
})