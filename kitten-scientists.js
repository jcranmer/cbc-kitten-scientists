
// ==============================
// Configure overall page display
// ==============================

var version = 'Kitten Scientists version 1.1.2';
var container = $('#game');
var column = $('.column');

container.css({
    fontFamily: 'Courier New',
    fontSize: '12px',
    minWidth: '1300px',
    top: '32px'
});

column.css({
    minHeight: 'inherit',
    maxWidth: 'inherit',
    padding: '1%',
    margin: 0
});

var left = $('#leftColumn');
var middle = $('#midColumn');
var right = $('#rightColumn');

left.css({
    height: '92%',
    width: '26%'
});

middle.css({
    marginTop: '1%',
    height: '92%',
    width: '48%'
});

right.css({
    height: '92%',
    width: '19%'
});

// Reconfigure dynamic page display
// ================================

var addRule = function (rule) {
    var sheets = document.styleSheets;
    sheets[0].insertRule(rule, 1);
};

addRule('#gameLog .msg {'
+ 'display: block;'
+ '}');

addRule('#resContainer .maxRes {'
+ 'color: #676766;'
+ '}');

addRule('#game .btn {'
+ 'border-radius: 0px;'
+ 'font-family: "Courier New";'
+ 'font-size: "10px";'
+ 'margin: 0 0 5px 0;'
+ '}');

addRule('#ks-options ul {'
+ 'list-style: none;'
+ 'margin: 0;'
+ 'padding: 0;'
+ '}');

// Add options element
// ===================

var getToggle = function (name, text) {
    var li = $('<li/>');

    var label = $('<label/>', {
        'for': 'toggle-' + name,
        text: text
    });

    var toggle = $('<input/>', {
        id: 'toggle-' + name,
        type: 'checkbox',
        checked: 'checked'
    });

    return li.append(toggle, label);
};

var optionsElement = $('<div/>', {id: 'ks-options', css: {marginBottom: '10px'}});
var optionsListElement = $('<ul/>');
var optionsTitleElement = $('<div/>', {
    css: { borderBottom: '1px solid gray', marginBottom: '5px' },
    text: version
});

optionsElement.append(optionsTitleElement);

optionsListElement.append(getToggle('engine', 'Freeze Scientists'));
optionsListElement.append(getToggle('craft', 'Auto Craft'));
optionsListElement.append(getToggle('build', 'Auto Build'));
optionsListElement.append(getToggle('housing', 'Auto Housing'));
optionsListElement.append(getToggle('hunt', 'Auto Hunt'));
optionsListElement.append(getToggle('luxury', 'Auto Luxury'));
optionsListElement.append(getToggle('praise', 'Auto Praise'));

// add the options above the game log
right.prepend(optionsElement.append(optionsListElement));

// ==========================================
// Begin Kitten Scientist's Automation Engine
// ==========================================

var game = gamePage;

var options = {
    interval: 500,
    amount: {
        craft: 0.5
    },
    auto: {
        build: true,
        builds: [
            {build: 'field', require: 'catnip'},
            {build: 'pasture', require: 'catnip'},
            {build: 'library', require: 'wood'},
            {build: 'academy', require: 'wood'},
            {build: 'mine', require: 'wood'},
            {build: 'barn', require: 'wood'},
            {build: 'lumberMill', require: 'minerals'},
            {build: 'workshop', require: 'minerals'},
            {build: 'amphitheatre', require: 'minerals'},
            {build: 'aqueduct', require: 'minerals'},
            {build: 'temple', require: 'gold'},
            {build: 'tradepost', require: 'gold'},
            {build: 'unicornPasture', require: false}
        ],
        housing: true,
        housings: [
            {housing: 'hut', require: 'wood'},
            {housing: 'logHouse', require: 'minerals'},
            {housing: 'mansion', require: 'titanium'}
        ],
        craft: true,
        crafts: [
            {craft: 'wood', require: 'catnip'},
            {craft: 'beam', require: 'wood'},
            {craft: 'slab', require: 'minerals'},
            {craft: 'plate', require: 'iron'},
            {craft: 'steel', require: 'coal'}
        ],
        hunt: true,
        luxury: true,
        luxuries: [
            {craft: 'manuscript', require: 'culture', stock: 'parchment'},
            // @TODO: dont rely on the mispelled resource for compendiums
            {craft: 'compedium', require: 'science', stock: 'manuscript'}
        ],
        praise: true
    },
    gameLog: {
        color: '#aa50fe' // dark purple
    },
    limit: {
        build: 0.75,
        housing: 0.85,
        craft: 0.95,
        hunt: 0.95,
        luxury: 0.99,
        praise: 0.99
    },
    stock: {
        compedium: 500,
        manuscript: 500,
        parchment: 500
    }
};

// GameLog Modification
// ====================

var gameLog = com.nuclearunicorn.game.log.Console().static;

var message = function () {
    var args = Array.prototype.slice.call(arguments);
    args[1] = args[1] || 'ks-default';

    // update the color of the message immediately after adding
    gameLog.msg.apply(gameLog, args);
    $('.type_' + args[1]).css('color', options.gameLog.color);
};

// Engine manager
// ==============

var Engine = function () {
    this.builds = new Builds();
    this.crafts = new Crafts();
    this.housings = new Builds();
};

Engine.prototype = {
    builds: undefined,
    crafts: undefined,
    interval: false,
    start: function () {
        if (this.loop) return;

        this.loop = setInterval(this.iterate.bind(this), options.interval);
        message('Starting the kitten scientists!');
    },
    stop: function () {
        if (!this.loop) return;

        clearInterval(this.loop);
        this.loop = false;
        message('Freezing the kitten scientists!');
    },
    iterate: function () {
        this.observeGameLog();
        if (options.auto.praise) this.praiseSun();
        if (options.auto.hunt) this.sendHunters();
        if (options.auto.build) this.startBuilds();
        if (options.auto.housing) this.startHousings();
        if (options.auto.craft) this.startCrafts();
        if (options.auto.luxury) this.startLuxury();
    },
    observeGameLog: function () {
        $('#gameLog').find('input').click();
    },
    praiseSun: function () {
        var currentTab = game.activeTabId;
        var faith = this.crafts.getResource('faith');

        if (faith.value / faith.maxValue >= options.limit.praise) {
            game.activeTabId = 'Religion';
            game.render();

            message('The sun has been praised!');
            $(".nosel:contains('Praise the sun!')").click();

            game.activeTabId = currentTab;
            game.render();
        }
    },
    sendHunters: function () {
        var catpower = this.crafts.getResource('manpower');
        var workshop = game.workshop;
        var parchment = workshop.getCraft('parchment');

        if (catpower.value / catpower.maxValue > options.limit.hunt) {
            if (parchment.unlocked) {
                game.craftAll(parchment.name);
                message('Auto Hunt: crafted parchments');
            }

            message('Auto Hunt: Hunters deployed!');
            $("a:contains('Send hunters')").click();
        }
    },
    startBuilds: function () {
        var builds = this.builds;
        var crafts = this.crafts;
        var limits = options.limit.build;
        var build, require;

        for (i in options.auto.builds) {
            build = options.auto.builds[i];
            require = !build.require ? build.require : crafts.getResource(build.require);

            if (!require || require.value / require.maxValue >= limits) {
                builds.build(build.build);
            }
        }
    },
    // @TODO: refactor opportunity, unify the various crafting functions
    startHousings: function () {
        var housings = this.housings;
        var crafts = this.crafts;
        var limits = options.limit.housing;
        var housing, require;

        for (i in options.auto.housings) {
            housing = options.auto.housings[i];
            require = !housing.require ? housing.require : crafts.getResource(housing.require);

            if (!require || require.value / require.maxValue >= limits) {
                housings.build(housing.housing);
            }
        }
    },
    startLuxury: function () {
        var crafts = this.crafts;
        var limits = options.limit.luxury;
        var amount, cost, craft, require, stock;

        for (i in options.auto.luxuries) {
            craft = options.auto.luxuries[i];
            require = crafts.getResource(craft.require);
            stock = crafts.getResource(craft.stock);


            if (require.value / require.maxValue >= limits && stock.value > options.stock[stock.name]) {
                cost = crafts.getMaterials(craft.craft)[stock.name];
                amount = (stock.value - options.stock[stock.name]) * options.amount.craft / cost;

                cost = crafts.getMaterials(craft.craft)[require.name];
                amount = require.value * options.amount.craft / cost < amount ? require.value * options.amount.craft / cost : amount;

                crafts.craft(craft.craft, amount);
            }
        }
    },
    startCrafts: function () {
        var crafts = this.crafts;
        var amount = options.amount.craft;
        var limits = options.limit.craft;
        var cost, craft, require;

        for (i in options.auto.crafts) {
            craft = options.auto.crafts[i];
            require = crafts.getResource(craft.require);
            cost = crafts.getMaterials(craft.craft)[require.name];

            if (require.value / require.maxValue >= limits) {
                crafts.craft(craft.craft, require.value * amount / cost);
            }
        }
    }
};

// Building manager
// ================

var Builds = function () {
    this.crafts = new Crafts();
};

Builds.prototype = {
    crafts: undefined,
    build: function (name) {
        if (!this.isBuildable(name)) return;

        var label = this.getBuild(name).label;
        var button = $(".nosel:not('.disabled'):contains('" + label + "')");

        if (button.length === 0) return;

        button.click();
        message('Auto Build: +1 ' + label);
    },
    isBuildable: function (name) {
        var buildable = this.getBuild(name).unlocked;

        if (buildable) {
            var crafts = this.crafts;
            var prices = this.getPrices(name);

            var producable = true;
            for (i in prices) {
                var price = prices[i];

                if (crafts.getValue(price.name) < price.val) {
                    buildable = false;
                    if (crafts.getProducable(price.name) < price.val) {
                        producable = false;
                    }
                }
            }

            if (!buildable && producable) {
                buildable = true;
                for (i in prices) {
                    price = prices[i];
                    crafts.deepCraft(price.name, price.val);
                    if (crafts.getValue(price.name) < price.val) {
                        // Oops...
                        buildable = false;
                    }
                }
            }
        }

        return buildable;
    },
    getBuild: function (name) {
        return game.bld.getBuilding(name);
    },
    getPrices: function (name) {
        return game.bld.getPrices(name);
    }
};

// Crafting manager
// ================

var Crafts = function () {};

Crafts.prototype = {
    craft: function (name, amount) {
        if (name === undefined || amount < 1) return;
        if (!this.isCraftable(name, amount)) return;

        amount = Math.floor(amount);

        game.craft(name, amount);

        // determine actual amount after crafting upgrades
        var ratio = ('wood' === name) ? 'refineRatio' : 'craftRatio';
        amount = (amount * (game.bld.getEffect(ratio) + 1)).toFixed(2);

        message('Auto Craft: +' + amount + ' ' + name);
    },
    deepCraft: function (name, amount) {
        if (name === undefined || amount < 1) return;
        if (this.getValue(name) >= amount) return;
        if (this.getProducable(name) < amount) return;

        var resData = this.getResource(name);
        if (!resData.craftable)
            return this.craft(name, amount);

        // We already have this much...
        amount -= resData.value;
        // ... and we'll produce this much per click.
        amount = Math.ceil(amount / game.getResCraftRatio(name));

        var craftData = game.workshop.getCraft(name);
        for (var i = 0; i < craftData.prices.length; i++) {
            var depName = craftData.prices[i].name;
            this.deepCraft(craftData.prices[i].name,
              craftData.prices[i].val * amount);
        }

        this.craft(name, amount);
    },
    isCraftable: function (name, amount) {
        var craftable = false;
        var craft = this.getCraft(name);

        if (craft.unlocked) {
            craftable = true;

            for (i in craft.prices) {
                var price = craft.prices[i];

                if (this.getValue(price.name) < price.val * amount) {
                    console.log(price, this.getValue(price.name), price.val, amount);

                    craftable = false;
                }
            }
        }

        return craftable;
    },
    getCraft: function (name) {
        return game.workshop.getCraft(name);
    },
    getMaterials: function (name) {
        var materials = {};
        var prices = this.getCraft(name).prices;

        for (i in prices) {
            var price = prices[i];

            materials[price.name] = price.val;
        }

        return materials;
    },
    getResource: function (name) {
        return game.resPool.get(name);
    },
    getValue: function (name) {
        var value = this.getResource(name).value;
        if (name == 'catnip') {
            var depletion = game.getResourcePerTick(name, false, {
                modifiers: {
                    'catnip': 0.10 - game.calendar.getWeatherMod()
                }}) * 202 * 5;
            if (depletion < 0)
                value += depletion;
        }
        return value;
    },
    getProducable: function (name) {
        var resData = this.getResource(name);
        if (!resData.craftable || name === 'wood')
            return resData.value;
        var craftData = game.workshop.getCraft(name);
        if (!craftData.unlocked)
            return 0;
        var limit = 1 << 30;
        for (var i = 0; i < craftData.prices.length; i++) {
            var threshold = Math.floor(
                this.getProducable(craftData.prices[i].name) /
                craftData.prices[i].val);
            limit = Math.min(threshold, limit);
        }
        return limit * game.getResCraftRatio(name) + resData.value;
    }
};

// Initialize and set toggles for Engine
// =====================================

var engine = new Engine();
var toggleEngine = $('#toggle-engine');

toggleEngine.on('change', function () {
    if (toggleEngine.is(':checked')) {
        engine.start();
    } else {
        engine.stop();
    }
});

toggleEngine.trigger('change');

// Add toggles for options
// =======================

var autoOptions = ['build', 'housing', 'craft', 'hunt', 'luxury', 'praise'];

var ucfirst = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

$.each(autoOptions, function (event, option) {
    var toggle = $('#toggle-' + option);

    toggle.on('change', function () {
        if (toggle.is(':checked')) {
            options.auto[option] = true;
            message('Enabled Auto ' + ucfirst(option));
        } else {
            options.auto[option] = false;
            message('Disable Auto ' + ucfirst(option));
        }
    });
});
