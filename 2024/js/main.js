const cardTemplate = $('.card.template');
const spellbook = $('.spellbook');
const modal = $('.modal');
const sensitivity = .5;
let spells = [];
let preparedSpells = JSON.parse(localStorage.getItem('dnd2024PreparedSpells') || '[]');
let selectedSpell = null;
let inspectionFromBook = false;
let isDragging = false;
let targetCard = null;
let mouseOrigin = {};

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
    "enchantment" : "https://www.runicdice.com/cdn/shop/articles/School_of_Enchantment_Wizard_Guide_for_Beginners_Mastering_Mind_Control_in_D_D_5e_58efd774-cc6a-4f00-8f7f-9e6b853ffcea.png",
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

const classIcons = {
    artificer: 'lorc/rune-stone',
    bard: 'lorc/lyre',
    cleric: 'delapouite/aspergillum',
    druid: 'lorc/moon',
    fighter: 'delapouite/sword-brandish',
    paladin: 'delapouite/cross-shield',
    ranger: 'lorc/high-shot',
    rogue: 'lorc/plain-dagger',
    sorcerer: 'lorc/magic-swirl',
    warlock: 'delapouite/warlock-eye',
    wizard: 'delapouite/spell-book'
};
const classNames = Object.keys(classIcons);
const levelNames = ['Cantrip', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
let selectedClasses = [];
let selectedLevels = [];
let searchTerm = '';

$(document).ready(function() {
    loadSpells('./spells.json');
    $('.add-spell-button').on('click', openPicker);
    $('.close-modal').on('click', closeModal);
    $('.cancel-inspection').on('click', closeInspection);
    $('.confirm-spell').on('click', addSelectedSpell);
    $('.spell-search input').on('input', function() {
        searchTerm = $(this).val().trim().toLowerCase();
        renderPicker();
    });
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
    });
});

function loadSpells(file) {
    $.ajax({
        dataType: "json",
        url: file,
        success: function(data) {
            spells = data;
            buildFilters();
            renderSpellbook();
        }
    });
}

function buildCard(spell) {
    const card = cardTemplate.clone().removeClass('template').attr('data-spell', spell.name);
    card.find('.spell-slot span').html(spell.level === 0 ? 'C' : spell.level);
    card.find('.spell-name').html(spell.name);
    let description = markdown(spell.description);
    if (spell.cantripUpgrade) description += '<p><b>At Higher Levels.</b> ' + spell.cantripUpgrade + '</p>';
    if (spell.higherLevelSlot) description += '<p><b>Using a Higher-Level Spell Slot.</b> ' + spell.higherLevelSlot + '</p>';
    card.find('.spell-description').html(description);
    card.find('.spell-range').html(spell.range);
    card.find('.spell-duration').html(spell.duration);
    card.find('.image img').attr({ src: spell.art || schoolArts[spell.school], alt: spell.name });
    card.addClass(spell.school);
    card.find('.spell-school').css('background-image', 'url(./img/schools/' + spell.school + '.png)');
    card.find('.spell-type img').attr({ src: '../img/icons/' + schoolIcons[spell.school] + '.png', alt: spell.school });
    if (spell.ritual) card.find('.ritual').addClass('toggle');
    if (spell.concentration) card.find('.concentration').addClass('toggle');
    if (spell.components.includes('v')) card.find('.verbal').addClass('toggle');
    if (spell.components.includes('s')) card.find('.somatic').addClass('toggle');
    if (spell.components.includes('m')) card.find('.material').addClass('toggle');
    if (spell.material) card.find('.material').attr('title', `Material (${spell.material})`);
    card.find('.spell-action').html(actionTypes[spell.actionType]).addClass(spell.actionType);
    return card;
}

function buildFilters() {
    const availableClasses = [...new Set(spells.flatMap(spell => spell.classes))];
    classNames.filter(name => availableClasses.includes(name)).forEach(name => $('.class-filters').append(filterButton(name, name, 'class')));
    levelNames.forEach((name, level) => $('.level-filters').append(filterButton(name, level, 'level')));
    $('.filters').on('click', '.filter-option', function() {
        const button = $(this);
        const filter = button.data('filter');
        const value = button.data('value');
        button.toggleClass('selected');
        if (filter === 'class') selectedClasses = $('.class-filters .selected').map(function() { return $(this).data('value'); }).get();
        if (filter === 'level') selectedLevels = $('.level-filters .selected').map(function() { return Number($(this).data('value')); }).get();
        renderPicker();
    });
}

function filterButton(label, value, type) {
    const button = $('<button class="filter-option" type="button"><span></span></button>')
        .attr({ 'data-filter': type, 'data-value': value })
        .find('span').text(label).end();
    if (type === 'class') button.prepend($('<img>', {
        src: '../img/icons/' + classIcons[value] + '.png',
        alt: ''
    }));
    return button;
}

function openPicker() {
    selectedSpell = null;
    inspectionFromBook = false;
    searchTerm = '';
    $('.spell-search input').val('');
    $('.spell-picker-panel').show();
    $('.inspection').removeClass('visible');
    modal.removeClass('inspecting-picker').addClass('open').attr('aria-hidden', 'false');
    renderPicker();
}

function closeModal() {
    modal.removeClass('open inspecting-picker').attr('aria-hidden', 'true');
    $('.inspection').removeClass('visible');
    $('.spell-picker-panel').show();
    selectedSpell = null;
    inspectionFromBook = false;
}

function renderPicker() {
    const results = spells.filter(spell =>
        (!searchTerm || spell.name.toLowerCase().includes(searchTerm)) &&
        selectedClasses.every(className => spell.classes.includes(className)) &&
        (!selectedLevels.length || selectedLevels.includes(spell.level))
    );
    $('.result-count').text(results.length + ' spells found');
    $('.spell-list').empty();
    results.forEach(spell => {
        const card = buildCard(spell).addClass('picker-card');
        $('.spell-list').append(card);
    });
}

function openInspection(spell, fromBook) {
    modal.toggleClass('inspecting-picker', !fromBook).addClass('open').attr('aria-hidden', 'false');
    selectedSpell = spell;
    inspectionFromBook = fromBook;
    $('.spell-picker-panel')[fromBook ? 'hide' : 'show']();
    $('.inspection-card').empty().append(buildCard(spell).addClass('focused'));
    $('.confirm-spell').text(fromBook ? 'Remove from spellbook' : 'Add it to spellbook').toggleClass('remove-spell', fromBook);
    $('.inspection').addClass('visible');
}

function closeInspection() {
    if (!modal.hasClass('open')) return;
    $('.inspection').removeClass('visible');
    selectedSpell = null;
    if (inspectionFromBook) {
        closeModal();
        return;
    }
    modal.removeClass('inspecting-picker');
    $('.spell-picker-panel').show();
    inspectionFromBook = false;
}

function addSelectedSpell() {
    if (!selectedSpell) return;
    const index = preparedSpells.indexOf(selectedSpell.name);
    if ($('.confirm-spell').hasClass('remove-spell')) preparedSpells.splice(index, 1);
    else if (index === -1) preparedSpells.push(selectedSpell.name);
    localStorage.setItem('dnd2024PreparedSpells', JSON.stringify(preparedSpells));
    renderSpellbook();
    closeModal();
}

function renderSpellbook() {
    spellbook.empty();
    const prepared = spells.filter(spell => preparedSpells.includes(spell.name));
    if (!prepared.length) {
        spellbook.append('<div class="empty-spellbook"><span class="empty-mark">✦</span><h2>Your spellbook is empty</h2><p>Gather the spells you have prepared for this adventure.</p></div>');
        return;
    }
    [...new Set(prepared.map(spell => spell.level))].sort((a, b) => a - b).forEach(level => {
        const group = $('<section class="spell-group"><h2></h2><div class="spell-grid"></div></section>');
        group.find('h2').text(levelNames[level]);
        prepared.filter(spell => spell.level === level).forEach(spell => group.find('.spell-grid').append(buildCard(spell).addClass('book-card')));
        spellbook.append(group);
    });
}

$(document).on('click', '.picker-card', function() {
    openInspection(spells.find(spell => spell.name === $(this).data('spell')), false);
});

$(document).on('click', '.book-card', function() {
    openInspection(spells.find(spell => spell.name === $(this).data('spell')), true);
});

$(document).on('pointerdown', '.focused', function(e) {
    isDragging = true;
    targetCard = this;
    targetCard.addEventListener('pointerup', finishDrag, { once: true });
    targetCard.addEventListener('pointercancel', finishDrag, { once: true });
    targetCard.setPointerCapture(e.pointerId);
    mouseOrigin = {
        x: e.clientX,
        y: e.clientY
    };
    e.preventDefault();
});

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

$(document).on('pointermove', function(e) {
    if (!isDragging || !targetCard) return;

    // Calculate delta
    const x = (e.clientX - mouseOrigin.x) * sensitivity;
    const y = -(e.clientY - mouseOrigin.y) * sensitivity;

    //card.css('transform', 'rotateX(${x}deg) rotateY(${y}deg)');
    //targetCard.css('transform', 'rotateY(' + x + 'deg) rotateX(' + y + 'deg)');
    targetCard.style.transform = 'rotateY(' + x + 'deg) rotateX(' + y + 'deg)';
});

$(document).on('pointerup pointercancel', function(e) {
    finishDrag(e);
});

function finishDrag(e) {
    if (!isDragging || !targetCard) return;
    isDragging = false;
    targetCard.style.transform = 'rotateY(0deg) rotateX(0deg)';
    targetCard.releasePointerCapture?.(e.pointerId);
    targetCard = null;
}