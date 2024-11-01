$(document).ready(function()
{
    initSpells();
    initFilters();
});

function initSpells()
{
    console.log("Loading... spells");
    $.ajax({
        url: "./spells.txt",
        dataType: "text",
        async: true,
        success: function(data) {
            let spells = [];
            let cols = data.split("\r\n")[0].split("\t");
            let rows = data.split("\r\n").slice(1);

            //console.log(cols);
            //console.log(rows);

            for (let row of rows)
            {
                let spell = {};
                let entry = row.split("\t");

                if (entry[0] == "") // Skip empty rows/missing names
                {
                    continue;
                }

                for (i = 0; i < cols.length; i++)
                {
                    let col = cols[i];
                    let val = entry[i];

                    val = val.replace("\"", "");
                    val = val.replace('"', '');

                    // Cases
                    if (col == "classes")
                    {
                        val = val.split(",");
                    }
                    else if (col == "level")
                    {
                        val = Number(val);
                    }
                    // Boolean convert
                    if (val === "TRUE")
                    {
                        val = true;
                    }
                    else if (val === "FALSE")
                    {
                        val = false;
                    }
                    spell[col] = val;
                }
                spells.push(spell);
            }

            //console.log(spells);
            console.log("Successfully loaded spells.");
            console.log(spells);
            setupSpells(spells);
        },
        error: function() {
            console.log("Could not load spell list.");
        }
    });
}

function setupSpells(spells)
{
    let schoolIcons = {
        "Necromancy" : "skoll/raise-zombie",
        "Illusion" : "lorc/shadow-follower",
        "Enchantment" : "lorc/fairy-wand",
        "Transmutation" : "delapouite/vitruvian-man",
        "Evocation" : "lorc/embrassed-energy",
        "Divination" : "lorc/crystal-ball",
        "Conjuration" : "lorc/transportation-rings",
        "Abjuration" : "lorc/rosa-shield"
    }
    let container = $(".spell-gallery");
    for (spell of spells)
    {
        let obj = $(".spell-template").clone();
        obj.removeClass("spell-template");
        obj.addClass("spell");


        obj.attr("data-level", spell.level);
        obj.attr("data-class", spell.classes.join(","));
        obj.attr("data-type", spell.type);
        obj.attr("data-element", spell.element);

        obj.find(".title span").html(spell.name);
        obj.find(".title img").attr("src", "./img/icons/" + spell.icon + ".png");
        obj.find(".level").html(spell.level > 0 ? "lvl " + spell.level : "cantrip");
        obj.find(".school").html("<img src='./img/icons/" + schoolIcons[spell.school] + ".png'><br>" + spell.school);
        obj.find(".concentration").html(spell.concentration ? "<img src='./img/icons/lorc/brain.png' title='Concentration' alt='Concentration'>" : "");
        let components = "";
        if (spell.V) components += "<img src='./img/icons/lorc/lips.png' title='Verbal' alt='Verbal'>"
        if (spell.S) components += "<img src='./img/icons/lorc/hand.png' title='Somatic' alt='Somatic'>"
        obj.find(".components").html(components);
        obj.find(".range span").html(spell.range);
        obj.find(".duration span").html(spell.duration);
        obj.find(".casting-time span").html(spell.casting_time);
        obj.find(".description")
            .attr("title", spell.description == "" ? "..." : spell.description)
            .html(spell.description == "" ? "..." : spell.description.replace(/(\d+)?d(\d+)([\+\-]\d+)?/ig, "<span class='dice'>$&</span>"));
            //.html(spell.description == "" ? "..." : spell.description.replace(/(\d+)?d(\d+)([\+\-]\d+)?.*?damage/ig, "<span class='damage'>$&</span>").replace(/(\d+)?d(\d+)([\+\-]\d+)?/ig, "<span class='dice'>$&</span>"));

        container.append(obj);
    }

    $(".spell").click(function()
    {
        $(this).toggleClass("expanded");
    })
}

function initFilters()
{
    $(".select-list input[type=checkbox]").change(function()
    {
        if ($(this).attr("name") == "all")
        {
            $(this).parent().find("input[type=checkbox]:checked").prop("checked", false);
        }
        filterSpells();
    });
}

function filterSpells()
{
    let spells = $(".spell");
    spells.hide();

    let classes = $(".select-class input[type=checkbox]:checked").map(function()
    {
        return $(this).attr("name");
    }).get();

    let levels = $(".select-level input[type=checkbox]:checked").map(function()
    {
        return $(this).val();
    }).get();

    //console.log(classes);
    //console.log(levels);

    // Show spells that pass filter checks
    spells.each(function()
    {
        let spell = $(this);

        // Class filter
        if (classes.length > 0)
        {
            let classFound = false;
            let spellClasses = spell.attr("data-class").split(",");
            for (c of classes)
            {
                if (spellClasses.includes(c))
                {
                    classFound = true;
                }
            }
            if (!classFound) return;
        }
        // Level filter
        if (levels.length > 0)
        {
            if (!levels.includes(spell.attr("data-level")))
            {
                return;
            }
        }
        spell.show();
    });
}
