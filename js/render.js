function Root() {
    return html`

        <style>
            .glass {
                background-color: ${config.glass.background};
                backdrop-filter: blur(${config.glass.blur}px);
                height: 100%;
            }

            .glass---hover:hover {
                background-color: ${config.glass.backgroundHover};
            }

            input.glass---hover:focus {
                background-color: ${config.glass.backgroundHover};
            }

            .EditorRoot {
                background-color: ${config.glass.editorBackground};
            }
        </style>

        ${BackgroundImageUrl()}
        <section id="main"  class="animate__animated animate__fadeIn">
            
            <div id="Top" >
                ${Clock()}
                ${SearchBox()}
            </div>

            <div id="Bookmarks2" >
                ${config.bookmarks.map(category => BookmarkCategory({ 
                    label: category.category,
                    children: category.bookmarks.map(bookmark => Bookmark(bookmark)).join('')
                })).join('')}
            </div>
        </section>

        ${GamesDrawer()}
        ${EditorDialog({id: 'Config'})}

        <div id="Snow">
            ${Snow()}
        </div>
    `
}

function Bookmark({ label, url, baseUrl, logoUrl }) {

    let displayUrl = (baseUrl ?? url).replace('https://', '')

    // Prep the URL for FaviconKit
    let safeUrl = (logoUrl ?? baseUrl ?? url).replace('https://', '');
    safeUrl.replace('http://', '');

    let logoSrc =
    config.bookmarkOptions.useFaviconKit
    ?
    `https://api.faviconkit.com/${safeUrl}/16`
    :
    `http://www.google.com/s2/favicons?sz=192&domain_url=${logoUrl ?? baseUrl ?? url}`

    let target = config.bookmarkOptions.alwaysOpenInNewTab ? '_blank' : '';
    let rel = config.bookmarkOptions.alwaysOpenInNewTab ? 'noopener' : '';

    return html`
        <a target="${rel}" href="${url ?? baseUrl}" rel="${rel}" >
            <div class="Bookmark " >
                <div class="BookmarkIcon" >
                    <img height="16" width="16" src='${logoSrc}' />
                </div>

                <div class="BookmarkInfo" >
                    <div class="BookmarkInfo_Label" >${label}</div>
                    <div class="BookmarkInfo_Url" >${displayUrl}</div>
                </div>
            </div>
        </a>
    `
}

function BookmarkCategory({label, children}) {
    return html`
        <div class="BookmarkCategory glass" >
            <div class="BookmarkCategory_Label">${label}</div>
            <div class="BookmarkCategory_Bookmarks">${children}</div>
        </div>
    `;
}

function Clock() {
    return html`
        <div>
            <div id="TimePanel" >
                <div id="Clock"></div>
                <div id="Date"></div>
            </div>
        </div>
    `;
}

function BackgroundImageUrl() {

    let styles = {
        image: ``,
        mist: `
            pointer-events: none;
            z-index: -;
            background-image: url('./media/bunker-mist-1.png');
            background-size: cover;
            opacity: ${(config.background?.mist?.opacity ?? 0.7) / 100} 
        `
    }

    let mist = (config.background?.mist?.enabled ?? false)
    ?
    `
        <div id="background-mist1" class="background-mist" style="${styles.mist}" >
        </div>
        
        <div id="background-mist2" class="background-mist" style="${styles.mist}" >
        </div>
    `
    : '';
        
    
    ``

    return html`
        <div id="Background_ImageUrl" style="${styles.image}">
            
        </div>

        ${mist}
    `
}

function GoogleSearchBarIframe() {
    return 
}

function SearchBox() {
    return 
}

function GamesDrawer() {

    const steamGames = 
        config.steamGames && (config.steamGames.length > 0)
        ?
        `
        `
        : ''

    return html`
        <div class="DrawerRoot" style=" background-color:black;opacity: ${config.sidebar.idleOpacity.toString()};" >

            ${steamGames}
            
            <div class="DrawerHeader" >
                <h3>Configuration</h3>    
            </div>

            <div class="DrawerContent SteamDrawer_Configuration" > 
                <button onclick="__ToggleConfigEditor()" > Configure Bunker </button>
            </div>
        </div>
    `
}

function SteamGame({ id, title, logoHash }) {

    let logo = !!logoHash ? `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/${id}/${logoHash}.ico` :  'media/steam_icon_logo.svg'

    return html`
        <div>
            <a href="steam://rungameid/${id}" >
                <div class="SteamGame aSteamGame--expandable" >
                    <img class="SteamGame_Backdrop" src="https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/capsule_616x353.jpg" width="300" alt="game backdrop" />
                    <img class="SteamGame_Icon" width="46" src="${logo}" alt="game logo" />
                    <div class="SteamGame_Label" >${title}</div>
                </div>
            </a>
        </div>
    `
}

function setEditorError(text) {
    let elem = document.getElementById('Editor_ErrorMessage');
    elem.classList.add('open');
    elem.innerHTML = text;
}

function clearEditorError() {
    let elem = document.getElementById('Editor_ErrorMessage');
    elem.innerHTML = '&nbsp;';
}

function __ToggleConfigEditor() {
    let elem = document.getElementById('Editor_Config');
    allowKeyboard = elem.classList.toggle('open');
}

function __RevertEditorChanges() {
    let elem = document.getElementById('EditorTextarea_Config');
    elem.value = localStorage.getItem('saferoom_config') ?? defaultConfig;
    clearEditorError();
}

function __LoadConfigBackup() {
    let elem = document.getElementById('EditorTextarea_Config');
    console.log(elem);
    let backup = localStorage.getItem('saferoom_config_backup');

    clearEditorError();
    if(backup != null) {
        elem.value = backup;
        clearEditorError();
    } else {
        setEditorError('No previous config found!');
    }
}

function __ClearConfig() {
    localStorage.removeItem('saferoom_config');
    location.reload();
}

function __SaveConfig() {
    let elem = document.getElementById('EditorTextarea_Config');
    let json = elem.value;

    try {
        JSON.parse(json);
        localStorage.setItem('saferoom_config_backup', localStorage.getItem('saferoom_config'));
        localStorage.setItem('saferoom_config', elem.value);
        location.reload();
        clearEditorError();

        return 0;
    } catch (e) {
        setEditorError("Invalid JSON, save aborted!");
    }
}

function EditorDialog({ id }) {
    let cfg = localStorage.getItem('saferoom_config') ?? defaultConfig;

    // Props to https://stackoverflow.com/questions/6637341/use-tab-to-indent-in-textarea

    return html`
        <div class="EditorRoot glass" id="Editor_${id}" >
            <textarea
                spellcheck="false"
                id="EditorTextarea_${id}"

                onkeydown="if(event.keyCode===9){var v=this.value,s=this.selectionStart,e=this.selectionEnd;this.value=v.substring(0, s)+'    '+v.substring(e);this.selectionStart=this.selectionEnd=s+4;return false;}"
            >${cfg}</textarea>

            <div class="Editor_Toolbar">

                <div id="Editor_ErrorMessage" > &nbsp; </div>


                <div class="Editor_Actions">
                    <button onclick="__ToggleConfigEditor()" > Close </button>
                    
                    
                    <button onclick="__ClearConfig()" > Clear Config </button>
                    <button onclick="__RevertEditorChanges()" > Revert Changes </button>
                    <button onclick="__LoadConfigBackup()" > Load Previous </button>

                    <button onclick="__SaveConfig()" > Save </button>

                </div>

            </div>
        </div>
    `
}

function Snow() {
    return html`<div class="snow"></div>`.repeat( config.background?.snow?.enabled ? (config.background?.snow?.count ?? 200) : 0 )
}










function Render(html) {
    let root = document.querySelector('bunker');

    if( root ) {
        root.innerHTML = html;
    }
}

function html(strings, ...values) {
    let str = '';
    strings.forEach((string, i) => {
        str += string + (values[i] || '');
    });
    return str;
}

Render(Root());