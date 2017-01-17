var game = new Phaser.Game(800, 600, Phaser.AUTO, '');

game.state.add('play', {
    preload: function() {
      this.game.load.image('aerocephal', 'assets/allacrost_enemy_sprites/aerocephal.png');
  		this.game.load.image('arcana_drake', 'assets/allacrost_enemy_sprites/arcana_drake.png');
  		this.game.load.image('aurum-drakueli', 'assets/allacrost_enemy_sprites/aurum-drakueli.png');
  		this.game.load.image('bat', 'assets/allacrost_enemy_sprites/bat.png');
  		this.game.load.image('daemarbora', 'assets/allacrost_enemy_sprites/daemarbora.png');
  		this.game.load.image('deceleon', 'assets/allacrost_enemy_sprites/deceleon.png');
  		this.game.load.image('demonic_essence', 'assets/allacrost_enemy_sprites/demonic_essence.png');
  		this.game.load.image('dune_crawler', 'assets/allacrost_enemy_sprites/dune_crawler.png');
  		this.game.load.image('green_slime', 'assets/allacrost_enemy_sprites/green_slime.png');
  		this.game.load.image('nagaruda', 'assets/allacrost_enemy_sprites/nagaruda.png');
  		this.game.load.image('rat', 'assets/allacrost_enemy_sprites/rat.png');
  		this.game.load.image('scorpion', 'assets/allacrost_enemy_sprites/scorpion.png');
  		this.game.load.image('skeleton', 'assets/allacrost_enemy_sprites/skeleton.png');
  		this.game.load.image('snake', 'assets/allacrost_enemy_sprites/snake.png');
  		this.game.load.image('spider', 'assets/allacrost_enemy_sprites/spider.png');
  		this.game.load.image('stygian_lizard', 'assets/allacrost_enemy_sprites/stygian_lizard.png');

      this.game.load.image('gold_coin', 'assets/496_RPG_icons/I_GoldCoin.png');
      this.game.load.image('dagger', 'assets/496_RPG_icons/W_Dagger002.png');
      this.game.load.image('swordIcon1', 'assets/496_RPG_icons/S_Sword01.png');
  		this.game.load.image('forest', 'assets/Background/Forrest.png');


            // build panel for upgrades
      var bmd = this.game.add.bitmapData(250, 120);
      bmd.ctx.fillStyle = '#9a783d';
      bmd.ctx.strokeStyle = '#35371c';
      bmd.ctx.lineWidth = 12;
      bmd.ctx.fillRect(0, 0, 250, 120);
      bmd.ctx.strokeRect(0, 0, 250, 120);
      this.game.cache.addBitmapData('upgradePanel', bmd);

      var buttonImage = this.game.add.bitmapData(476, 48);
      buttonImage.ctx.fillStyle = '#e6dec7';
      buttonImage.ctx.strokeStyle = '#35371c';
      buttonImage.ctx.lineWidth = 4;
      buttonImage.ctx.fillRect(0, 0, 225, 48);
      buttonImage.ctx.strokeRect(0, 0, 225, 48);
      this.game.cache.addBitmapData('button', buttonImage);

      var status_bar_panel = this.game.add.bitmapData(790, 50);
      status_bar_panel.ctx.fillStyle = '#9a783d';
      status_bar_panel.ctx.strokeStyle = '#35371c';
      status_bar_panel.ctx.lineWidth = 12;
      status_bar_panel.ctx.fillRect(0, 0, 790, 50);
      status_bar_panel.ctx.strokeRect(0, 0, 790, 50);
      this.game.cache.addBitmapData('statusPanel', status_bar_panel);

  	},
    create: function() {

		var state = this;

		var bg = state.game.add.tileSprite(0, 0, state.game.world.width,
		    state.game.world.height, 'forest');
		//bg.tileScale.setTo(4,4);

    // the main player
    this.player = {
        clickDmg: 1,
        gold: 0,
        dps: 0,
        health: 100
    };

        // world progression
    this.level = 1;
    // how many monsters have we killed during this level
    this.levelKills = 0;
    // how many monsters are required to advance a level
    this.levelKillsRequired = 10;


        // setup the world progression display
    this.levelUI = this.game.add.group();
    this.levelUI.position.setTo(this.game.world.width - 150, 30);
    this.levelText = this.levelUI.addChild(this.game.add.text(0, 0, 'Level: ' + this.level, {
        font: '24px Arial Black',
        fill: '#fff',
        strokeThickness: 4
    }));
    this.levelKillsText = this.levelUI.addChild(this.game.add.text(0, 30, 'Kills: ' + this.levelKills + '/' + this.levelKillsRequired, {
        font: '24px Arial Black',
        fill: '#fff',
        strokeThickness: 4
    }));


    this.upgradePanel = this.game.add.image(5, 425, this.game.cache.getBitmapData('upgradePanel'));
    this.statusPanel = this.game.add.image(5, 547, this.game.cache.getBitmapData('statusPanel'));
    var upgradeButtons = this.upgradePanel.addChild(this.game.add.group());
    upgradeButtons.position.setTo(8, 10);

    var upgradeButtonsData = [
        {icon: 'dagger', name: 'Attack', level: 0, cost: 5, purchaseHandler: function(button, player) {
            player.clickDmg += 1;
        }},
        {icon: 'swordIcon1', name: 'Auto-Attack', level: 0, cost: 1, purchaseHandler: function(button, player) {
            player.dps += 1;
        }}
    ];

    var button;
    upgradeButtonsData.forEach(function(buttonData, index) {
        button = state.game.add.button(0, (50 * index), state.game.cache.getBitmapData('button'));
        button.icon = button.addChild(state.game.add.image(6, 6, buttonData.icon));
        button.text = button.addChild(state.game.add.text(42, 6, buttonData.name + ': ' + buttonData.level, {font: '16px Arial Black'}));
        button.details = buttonData;
        button.costText = button.addChild(state.game.add.text(42, 24, 'Cost: ' + buttonData.cost, {font: '16px Arial Black'}));
        button.events.onInputDown.add(state.onUpgradeButtonClick, state);

        upgradeButtons.addChild(button);
    });



    this.dmgTextPool = this.add.group();
    var dmgText;
    for (var d=0; d<50; d++) {
        dmgText = this.add.text(0, 0, '1', {
            font: '64px Arial Black',
            fill: '#fff',
            strokeThickness: 4
        });
        // start out not existing, so we don't draw it yet
        dmgText.exists = false;
        dmgText.tween = game.add.tween(dmgText)
            .to({
                alpha: 0,
                y: 100,
                x: this.game.rnd.integerInRange(100, 700)
            }, 2000, Phaser.Easing.Cubic.Out);

        dmgText.tween.onComplete.add(function(text, tween) {
            text.kill();
        });
        this.dmgTextPool.add(dmgText);
    }

    this.dpsTextPool = this.add.group();
    var dpsText;
    for (var d=0; d<50; d++) {
        dpsText = this.add.text(0, 0, '1', {
            font: '64px Arial Black',
            fill: '#FF0000',
            strokeThickness: 4
        });
        // start out not existing, so we don't draw it yet
        dpsText.exists = false;
        dpsText.tween = game.add.tween(dpsText)
            .to({
                alpha: 0,
                y: 100,
                x: this.game.rnd.integerInRange(100, 700)
            }, 2000, Phaser.Easing.Cubic.Out);

        dpsText.tween.onComplete.add(function(text, tween) {
            text.kill();
        });
        this.dpsTextPool.add(dpsText);
    }


    this.coinValuePool = this.add.group();
    var coinValue;
    for (var d=0; d<50; d++) {
        coinValue = this.add.text(0, 0, '1', {
            font: '64px Arial Black',
            fill: '#FFFF00',
            strokeThickness: 4
        });
        // start out not existing, so we don't draw it yet
        coinValue.exists = false;
        coinValue.tween = game.add.tween(coinValue)
            .to({
                alpha: 0,
                y: 100,
                x: this.game.rnd.integerInRange(100, 700)
            }, 2000, Phaser.Easing.Cubic.Out);

        coinValue.tween.onComplete.add(function(text, tween) {
            text.kill();
        });
        this.coinValuePool.add(coinValue);
    }

    // create a pool of gold coins
    this.coins = this.add.group();
    this.coins.createMultiple(50, 'gold_coin', '', false);
    this.coins.setAll('inputEnabled', true);
    this.coins.setAll('goldValue', 1);
    this.coins.callAll('events.onInputDown.add', 'events.onInputDown', this.onClickCoin, this);


    var monsterData = [
        {name: 'Aerocephal',        image: 'aerocephal',        maxHealth: 10, maxDmg: 2},
        {name: 'Arcana Drake',      image: 'arcana_drake',      maxHealth: 20, maxDmg: 3},
        {name: 'Aurum Drakueli',    image: 'aurum-drakueli',    maxHealth: 30, maxDmg: 4},
        {name: 'Bat',               image: 'bat',               maxHealth: 5,  maxDmg: 1},
        {name: 'Daemarbora',        image: 'daemarbora',        maxHealth: 10, maxDmg: 2},
        {name: 'Deceleon',          image: 'deceleon',          maxHealth: 10, maxDmg: 2},
        {name: 'Demonic Essence',   image: 'demonic_essence',   maxHealth: 15, maxDmg: 2},
        {name: 'Dune Crawler',      image: 'dune_crawler',      maxHealth: 8,  maxDmg: 1},
        {name: 'Green Slime',       image: 'green_slime',       maxHealth: 3,  maxDmg: 1},
        {name: 'Nagaruda',          image: 'nagaruda',          maxHealth: 13, maxDmg: 2},
        {name: 'Rat',               image: 'rat',               maxHealth: 2,  maxDmg: 1},
        {name: 'Scorpion',          image: 'scorpion',          maxHealth: 2,  maxDmg: 1},
        {name: 'Skeleton',          image: 'skeleton',          maxHealth: 6,  maxDmg: 1},
        {name: 'Snake',             image: 'snake',             maxHealth: 4,  maxDmg: 1},
        {name: 'Spider',            image: 'spider',            maxHealth: 4,  maxDmg: 1},
        {name: 'Stygian Lizard',    image: 'stygian_lizard',    maxHealth: 20, maxDmg: 3}
    ];




    this.playerGoldText = this.add.text(15, 557, 'Gold: ' + this.player.gold, {
        font: '24px Arial Black',
        fill: '#fff',
        strokeThickness: 4
    });

    this.playerDmgText = this.add.text(130, 557, 'DMG: ' + this.player.clickDmg, {
        font: '24px Arial Black',
        fill: '#fff',
        strokeThickness: 4
    });

    this.playerDpsText = this.add.text(245, 557, 'DPS: ' + this.player.dps, {
        font: '24px Arial Black',
        fill: '#fff',
        strokeThickness: 4
    });

    this.playerHealthText = this.add.text(360, 557, 'Health: ' + this.player.health, {
        font: '24px Arial Black',
        fill: '#fff',
        strokeThickness: 4
    });
		this.monsters = this.game.add.group();

		var monster;
		monsterData.forEach(function(data) {
			// create a sprite for them off screen
			monster = state.monsters.create(2000, state.game.world.centerY, data.image);
			// center anchor
			monster.anchor.setTo(0.5);
			// reference to the database
			monster.details = data;

      // use the built in health component
      monster.health = monster.maxHealth = data.maxHealth;

      // hook into health and lifecycle events
      monster.events.onKilled.add(state.onKilledMonster, state);
      monster.events.onRevived.add(state.onRevivedMonster, state);

			//enable input so we can click it!
			monster.inputEnabled = true;
			monster.events.onInputDown.add(state.onClickMonster, state);
		});


		this.currentMonster = this.monsters.getRandom();
		this.currentMonster.position.set(this.game.world.centerX, this.game.world.centerY);

    this.monsterInfoUI = this.game.add.group();
    this.monsterInfoUI.position.setTo(this.game.world.centerX - 110, this.game.world.centerY + 140);
    this.monsterNameText = this.monsterInfoUI.addChild(this.game.add.text(0, 0, this.currentMonster.details.name, {
        font: '48px Arial Black',
        fill: '#fff',
        strokeThickness: 4
    }));
    this.monsterHealthText = this.monsterInfoUI.addChild(this.game.add.text(0, 60, this.currentMonster.health + ' HP', {
        font: '32px Arial Black',
        fill: '#ff0000',
        strokeThickness: 4
    }));

    // 100ms 10x a second
    this.dpsTimer = this.game.time.events.loop(100, this.onDPS, this);


	},
    render: function() {
        },


    onDPS: function() {
        if (this.player.dps > 0) {
            if (this.currentMonster && this.currentMonster.alive) {
                var dmg = this.player.dps / 10;
                var healthBeforeDmg = Math.round(this.currentMonster.health);
                this.currentMonster.damage(dmg);
                // update the health text
                this.monsterHealthText.text = this.currentMonster.alive ? Math.round(this.currentMonster.health) + ' HP' : 'DEAD';
                if (Math.round(this.currentMonster.health) != healthBeforeDmg) {
                var dpsText = this.dpsTextPool.getFirstExists(false);
                  if (dpsText) {
                    dpsText.text = this.player.dps;
                    dpsText.reset(this.currentMonster.position.x, this.currentMonster.position.y);
                    dpsText.alpha = 1;
                    dpsText.tween.start();

                  }
                }
            }
        }
    },

	onClickMonster: function(monster,pointer) {
    // apply click damage to monster
    this.currentMonster.damage(this.player.clickDmg);
    this.monsterHealthText.text = this.currentMonster.alive ? Math.round(this.currentMonster.health) + ' HP' : 'DEAD';

    var dmgText = this.dmgTextPool.getFirstExists(false);
      if (dmgText) {
        dmgText.text = this.player.clickDmg;
        dmgText.reset(pointer.positionDown.x, pointer.positionDown.y);
        dmgText.alpha = 1;
        dmgText.tween.start();
      }
	},

  onKilledMonster: function(monster) {
    // move the monster off screen again
    monster.position.set(1000, this.game.world.centerY);

    var coin;
    // spawn a coin on the ground
    coin = this.coins.getFirstExists(false);
    coin.reset(this.game.world.centerX + this.game.rnd.integerInRange(-100, 100), this.game.world.centerY);
    game.world.bringToTop(this.coins);
    coin.goldValue = Math.round(this.level * 1.33);
    this.game.time.events.add(Phaser.Timer.SECOND * 3, this.onClickCoin, this, coin);

    this.levelKills++;

    if (this.levelKills >= this.levelKillsRequired) {
        this.level++;
        this.levelKills = 0;
    }

    // pick a new monster
    this.currentMonster = this.monsters.getRandom();
    // upgrade the monster based on level
    this.currentMonster.maxHealth = Math.ceil(this.currentMonster.details.maxHealth + ((this.level - 1) * 10.6));
    // make sure they are fully healed
    this.currentMonster.revive(this.currentMonster.maxHealth);

    this.levelText.text = 'Level: ' + this.level;
    this.levelKillsText.text = 'Kills: ' + this.levelKills + '/' + this.levelKillsRequired;

  },



  onRevivedMonster: function(monster) {
    monster.position.set(this.game.world.centerX, this.game.world.centerY);
    // update the text display
    this.monsterNameText.text = monster.details.name;
    this.monsterHealthText.text = monster.health + 'HP';
  },


  onClickCoin: function(coin) {
      if (!coin.alive) {
      return;
    }
      // give the player gold
      this.player.gold += coin.goldValue;
      // update UI
      this.playerGoldText.text = 'Gold: ' + this.player.gold;

      var coinValue = this.coinValuePool.getFirstExists(false);
        if (coinValue) {
          coinValue.text = coin.goldValue;
          coinValue.reset(coin.position.x, coin.position.y);
          coinValue.alpha = 1;
          coinValue.tween.start();
        }
      // remove the coin
      coin.kill();
  },


  onUpgradeButtonClick: function(button, pointer) {
    // make this a function so that it updates after we buy
    function getAdjustedCost() {
        return Math.ceil(button.details.cost + (button.details.level * 1.46));
    }

    if (this.player.gold - getAdjustedCost() >= 0) {
        this.player.gold -= getAdjustedCost();
        this.playerGoldText.text = 'Gold: ' + this.player.gold;

        button.details.level++;
        button.text.text = button.details.name + ': ' + button.details.level;
        button.costText.text = 'Cost: ' + getAdjustedCost();

        button.details.purchaseHandler.call(this, button, this.player);

        this.playerDmgText.text = 'DMG: ' + this.player.clickDmg;
        this.playerDpsText.text = 'DPS: ' + this.player.dps;

    }
  }
});

game.state.start('play');
