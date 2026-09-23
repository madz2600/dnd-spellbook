const container = $('.container');
//const card = $('.card');
const cardTemplate = $('.card.template');
const sensitivity = .5;
let isDragging = false;
let targetCard = false;
let mouseOrigin = {}

const schoolIcons = {
    "necromancy" : "skoll/raise-zombie",
    "illusion" : "lorc/shadow-follower",
    "enchantment" : "lorc/fairy-wand",
    "transmutation" : "delapouite/vitruvian-man",
    //"evocation" : "lorc/embrassed-energy",
    "evocation" : "lorc/unstable-orb",
    "divination" : "lorc/crystal-ball",
    "conjuration" : "lorc/transportation-rings",
    "abjuration" : "lorc/rosa-shield"
}
const schoolArts = {
    "abjuration" : "https://mktg-assets.tcgplayer.com/fit-in/1000x1000/filters:quality(75)/content/opengraph/MTG-Syncopate-VOW.jpg",
    "conjuration" : "https://i0.wp.com/nerdarchy.com/wp-content/uploads/2021/07/mtg-basic-conjuration-spells-5E-DD-strixhaven.jpg?fit=920%2C690&ssl=1&w=640",
    "divination" : "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/edac9d2b-74dc-41a2-8f6b-29e3d2dbefa5/d6uneu0-98ef8449-996e-4627-9b79-4e8acd8df416.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi9lZGFjOWQyYi03NGRjLTQxYTItOGY2Yi0yOWUzZDJkYmVmYTUvZDZ1bmV1MC05OGVmODQ0OS05OTZlLTQ2MjctOWI3OS00ZThhY2Q4ZGY0MTYuanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.BxP9HE_IJ0hMVjcEgWqXpletegYqZZ8Cwz5cBVe8PaM",
    "enchantment" : "https://www.runicdice.com/cdn/shop/articles/School_of_Enchantment_Wizard_Guide_for_Beginners_Mastering_Mind_Control_in_D_D_5e_8e01802b-bfd1-4ce2-bbbc-0b8225ba0844.png?v=1771426442",
    "evocation" : "https://www.wargamer.com/wp-content/sites/wargamer/2023/01/dnd-wizard-spells-5e-tasha-spellbook.jpg",
    "illusion" : "https://static0.thegamerimages.com/wordpress/wp-content/uploads/2020/02/fear-Cropped.jpg?q=50&fit=crop&w=749&dpr=1.5",
    "necromancy" : "https://static0.cbrimages.com/wordpress/wp-content/uploads/2021/06/Time-Ravage-Cropped.jpg?q=50&fit=crop&w=825&dpr=1.5",
    "transmutation" : "https://static0.gamerantimages.com/wordpress/wp-content/uploads/2020/06/Shape-Water-Most-Useful-DND-5e-Spells.jpg?q=70&fit=crop&w=825&dpr=1"
}
const actionTypes = {
    "action" : "Action",
    "bonusAction" : "Bonus Action",
    "reaction" : "Reaction"
}

// Disable text selection, allow scrolling
document.onselectstart = new Function ("return false");

$(document).ready(function() {
    loadSpells('./spells.json');
});

function addListeners() {
    /* Mouse events */
    $('.card').mousedown(function(e) {
        dragStart(e);
    });

    $(document).mousemove(function(e) {
        dragMove(e);
    });

    $(document).mouseup(function(e) {
        dragEnd();
    });

    /* Touch events */
    /*
    $('.card').on("touchstart", function(e) {
        dragStart(e.originalEvent.touches[0]);
    });

    $(document).on("touchmove", function(e) {
        dragMove(e.originalEvent.changedTouches[0]);
    });

    $(document).on("touchend", function(e) {
        dragEnd();
    });
    */
}

function loadSpells(file) {
    $.ajax({
        dataType: "json",
        url: file,
        success: function(data) {
            const maxSpells = 64;
            $.each(data, function(n, spell) {
                //console.log(spell);
                let card = cardTemplate.clone();
                card.removeClass("template");

                // Spell level
                card.find('.spell-slot span').html(spell.level == 0 ? 'C' : spell.level);
                
                // Spell name
                card.find('.spell-name').html(spell.name);

                // Description
                let description = markdown(spell.description);
                if (spell.cantripUpgrade) description += '<p><b>At Higher Levels.</b> ' + spell.cantripUpgrade + '</p>';
                if (spell.higherLevelSlot) description += '<p><b>Using a Higher-Level Spell Slot.</b> ' + spell.higherLevelSlot + '</p>';
                
                card.find('.spell-description').html(description);

                // Range and duration (concentration)
                card.find('.spell-range').html(spell.range);
                card.find('.spell-duration').html(spell.duration);

                // Card art
                card.find('.image img').attr('src', spell.art ? spell.art : schoolArts[spell.school]);

                // Card school
                card.addClass(spell.school);
                card.find('.spell-school').css('background-image', 'url(./img/schools/' + spell.school + '.png)');

                // Spell type
                card.find('.spell-type img').attr('src', '../img/icons/' + schoolIcons[spell.school] + '.png');
                
                // Spell components/stats
                if (spell.ritual) card.find('.ritual').addClass('toggle');
                if (spell.concentration) card.find('.concentration').addClass('toggle');
                if (spell.components.includes('v')) card.find('.verbal').addClass('toggle');
                if (spell.components.includes('s')) card.find('.somatic').addClass('toggle');
                if (spell.components.includes('m')) card.find('.material').addClass('toggle');

                card.find('.spell-action')
                    .html(actionTypes[spell.actionType])
                    .addClass(spell.actionType);

                container.append(card);
                
                //if (n + 1 >= maxSpells) return false;
            });
        }
    });
    //.done(addListeners);
}

function dragStart(e) {
    isDragging = true;
    container.addClass('dragging');
    targetCard = e.target.closest('.card');
    mouseOrigin = {
        x: e.clientX,
        y: e.clientY
    }
}

function randomSpellArt() {
    let src = [
        'https://www.wargamer.com/wp-content/sites/wargamer/2023/01/dnd-wizard-spells-5e-tasha-spellbook.jpg',
        'https://static0.srcdn.com/wordpress/wp-content/uploads/2024/08/d-d-spell-2024.jpg',
        'https://static.wikia.nocookie.net/forgottenrealms/images/7/7b/Speak_with_dead-5e.jpg/revision/latest?cb=20200513004719',
        'https://static0.gamerantimages.com/wordpress/wp-content/uploads/2020/06/Shape-Water-Most-Useful-DND-5e-Spells.jpg?q=70&fit=crop&w=825&dpr=1',
        'https://static0.thegamerimages.com/wordpress/wp-content/uploads/2024/12/untitled-design-44.jpg?q=49&fit=crop&w=825&dpr=2',
        'https://static0.cbrimages.com/wordpress/wp-content/uploads/2021/06/Time-Ravage-Cropped.jpg?q=50&fit=crop&w=825&dpr=1.5',
        'https://artificialtwenty.com/wp-content/uploads/2024/02/aasimar-dnd-5e.jpg?w=723',
        'https://artificialtwenty.com/wp-content/uploads/2024/02/enervate-dnd-5e.jpg?w=1024',
        'https://artificialtwenty.com/wp-content/uploads/2024/02/lightning-lure-dnd-5e.jpg?w=1024',
        'https://artificialtwenty.com/wp-content/uploads/2024/02/druid-dnd-5e.jpg?w=1024',
        'https://artificialtwenty.com/wp-content/uploads/2024/02/divine-soul-sorcerer-dnd-5e-1.jpg?w=723'
    ];
    return src[Math.floor(Math.random() * src.length)];
}

function dragMove(e) {
    if (!isDragging) return;

    // Calculate delta
    const x = (e.clientX - mouseOrigin.x) * sensitivity;
    const y = -(e.clientY - mouseOrigin.y) * sensitivity;

    //card.css('transform', 'rotateX(${x}deg) rotateY(${y}deg)');
    //targetCard.css('transform', 'rotateY(' + x + 'deg) rotateX(' + y + 'deg)');
    targetCard.style.transform = 'rotateY(' + x + 'deg) rotateX(' + y + 'deg)';
}

function dragEnd() {
    if (isDragging) {
        isDragging = false;
        container.removeClass('dragging');
        //targetCard.css('transform', 'rotateX(0deg) rotateY(0deg)');
        targetCard.style.transform = 'rotateY(0deg) rotateX(0deg)';
    }
}