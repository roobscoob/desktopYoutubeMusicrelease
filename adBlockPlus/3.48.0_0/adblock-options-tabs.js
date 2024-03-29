
function activateTab(tabID) {
  let $activeTab = $(`[href=${ tabID }]`);
  let $allTabs = $('.tablink');
  let $allTabPanels = $('.tab');

  $allTabs.removeClass('active');
  $allTabPanels.hide();

  $activeTab.addClass('active');

  $.cookie('active_tab', $activeTab.attr('href'), {
    expires: 10,
  });

  displayActiveTab($activeTab);
}

// Load tab panel script in the document when the tab is
// activated for the first time.
// Inputs: $activeTabPanel -- jQuery Object
function loadTabPanelScript($activeTabPanel) {
  let activePanelID = $activeTabPanel.attr('id');
  let scriptToLoad = `adblock-options-${ activePanelID }.js`;
  let scriptTag = document.createElement('script');
  let alreadyLoaded = $(`script[src="${ scriptToLoad }"]`).length > 0;

  if (alreadyLoaded) return; // dont' load twice the same script

  // Don't use $().append(scriptTag) because CSP blocks eval
  scriptTag.src = scriptToLoad;
  document.body.appendChild(scriptTag);
}

// Show or hide myAdBlock subtabs based on
// which tab is currently active. All subtabs
// links must have a data-parent-tab attribute
// Inputs: $activeTab -- jQuery object
function handleSubTabs($activeTab) {
  let activeTabHref = $activeTab.attr('href');
  let $activeTabNestedUL = $(`[data-parent-tab=${ activeTabHref }]`);
  let $activeTabUL = $activeTab.closest('ul');
  let subtabIsActive = $activeTabUL[0].hasAttribute('data-parent-tab');
  let parentTabIsActive = !!$activeTabNestedUL.length;

  // hide all subtabs ul elements
  $('[data-parent-tab]').hide();

  if (subtabIsActive) {
    $activeTabUL.show().fadeTo('slow', 1);
  } else if (parentTabIsActive) {
    $activeTabNestedUL.show().fadeTo('slow', 1);
  }
}

// Add myAdBlock tab HTML and respective subtabs if user is enrolled
function addMyAdBlockTab() {
  if (!License) {
    return false;
  }
  let showMyAdBlockTab = License.shouldShowMyAdBlockEnrollment() || License.isActiveLicense();
  if (!showMyAdBlockTab) {
    return false;
  }

  let myAdBlockTab = '\
  <li id="myadblock-tab">\
    <a href="#mab" class="tablink">\
      <i class="material-icons md-18"></i><span i18n="myadblockoptions"></span>\
    </a>\
  </li>';

  let $tabsUL = $('#sidebar-tabs > ul:not(.has-myadblock)');

  $tabsUL.prepend(myAdBlockTab);
  $tabsUL.addClass('has-myadblock');

  if (License.shouldShowMyAdBlockEnrollment()) {
    $('#myadblock-tab').show();
    $('#myadblock-tab i').text('lock');
    return true;
  } else if (License.isActiveLicense()) {
    $('#myadblock-tab').show();
    $('#myadblock-tab i').text('account_circle');
    return true;
  } else {
    $('#myadblock-tab').hide();
    return false;
  }
};

// Load all HTML templates in respective tab panels
// and translate strings on load completion
function loadTabPanelsHTML() {
  let $tabPanels = $('#tab-content .tab');
  $.each($tabPanels, function(i, panel) {
    let panelID = $(panel).attr('id');
    let panelHTML = `adblock-options-${ panelID }.html`;
    $(panel).load(panelHTML, function() {
      localizePage();
    }); 
  });
}

// Display tabs and panel based on the current active tab
// Inputs: $activeTab - active tab jQuery object
function displayActiveTab($activeTab) {
  let $activeTabPanel = $($activeTab.attr('href'));
  handleSubTabs($activeTab);
  loadTabPanelScript($activeTabPanel);
  $activeTabPanel.show();
}

// Active tab cannot be #mab at any point
// if mab tab doesn't exist
// Inputs:
//    - tabID -- string (active tab ID with ')
//    - mabExists -- bool (true if enrolled to MAB)
function validateTabID(tabID, mabExists) {
  var defaultTabID = '#general';
  if (!tabID)
    return defaultTabID;
  if (tabID === '#mab' && !mabExists)
    return defaultTabID;
  return tabID;
}

// Get active tab ID from cookie or URL hash and activate tab
// and display the tabs and tabel accordingly
function activateTabOnPageLoad(myAdBlockExists) {
  // Set active tab from cookie
  let activeTabID = $.cookie('active_tab');
  activeTabID = validateTabID(activeTabID, myAdBlockExists);

  // Set active tab from hash (has priority over cookie)
  if (window.location && window.location.hash) {
    let hashID = window.location.hash.split('_')[0];
    activeTabID = validateTabID(hashID, myAdBlockExists);
  }
  // Activate and display tab
  let $activeTab = $(`.tablink[href=${ activeTabID }]`).addClass('active');
  displayActiveTab($activeTab);
}

$(document).ready(function () {
  // 1. add the myadblock tab if user is enrolled
  let myAdBlockTabAdded = addMyAdBlockTab();

  // 2. load all the tab panels templates in respective panel DIVs
  loadTabPanelsHTML();

  // 3. Activate tab on page load with cookie, URL hash or default tabID
  activateTabOnPageLoad(myAdBlockTabAdded);

  // 4. Activate tab when clicked
  $('.tablink').click(function() {
    let tabID = $(this).attr('href');
    activateTab(tabID);
  });
});
