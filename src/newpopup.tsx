import React, {FC} from "react"
import ReactDOM from "react-dom"
import {createRoot} from "react-dom/client"
import {Paper, Select, Switch} from "@mui/material"

const Popup: FC = (props: {}) => {
    return (<>
        <header>
            <img alt="Wudooh Logo" id="wudoohLogo" src="icons/WudoohLogo.svg" width="250"/>
        </header>

        <div className="centered">
            <label className="material-switch">
                <input id="onOffSwitch" type="checkbox"/>
                <span title="Turn extension on or off"/>
            </label>
        </div>

        <div id="main">
            <div className="select">
                <select className="select-text" id="font-select" title="Select font">
                    <option style={{fontFamily: "Aldhabi, sans-serif"}} value="Aldhabi">الذهبي</option>
                    <option style={{fontFamily: "Almarai, sans-serif"}} value="Almarai">المراعي</option>
                    <option style={{fontFamily: "Amiri, sans-serif"}} value="Amiri">أميري</option>
                    <option style={{fontFamily: "Amiri Quran, sans-serif"}} value="Amiri Quran">أميري قرآن</option>
                    <option style={{fontFamily: "Andalus, sans-serif"}} value="Andalus">أندلس</option>
                    <option style={{fontFamily: "Arabic Typesetting, sans-serif"}} value="Arabic Typesetting">تنضيد
                    </option>
                    <option style={{fontFamily: "Aref Ruqaa', sans-serif"}} value="Aref Ruqaa">رُقعة عارف</option>
                    <option style={{fontFamily: "Cairo', sans-serif"}} value="Cairo">القاهرة</option>
                    <option style={{fontFamily: "Changa', sans-serif"}} value="Changa">چنگه</option>
                    <option style={{fontFamily: "Droid Arabic Naskh', sans-serif"}} value="Droid Arabic Naskh">درويد
                        نسخ
                    </option>
                    <option style={{fontFamily: "Dubai', sans-serif"}} value="Dubai">دبي</option>
                    <option style={{fontFamily: "El Messiri', sans-serif"}} value="El Messiri">المسّيري</option>
                    <option style={{fontFamily: "Harmattan', sans-serif"}} value="Harmattan">هرمتان</option>
                    <option style={{fontFamily: "Jomhuria', sans-serif"}} value="Jomhuria">جمهورية</option>
                    <option style={{fontFamily: "Katibeh', sans-serif"}} value="Katibeh">كتيبة</option>
                    <option style={{fontFamily: "Lalezar', sans-serif"}} value="Lalezar">لاله‌زار</option>
                    <option style={{fontFamily: "Lateef', sans-serif"}} value="Lateef">لطيف</option>
                    <option style={{fontFamily: "Lemonada', sans-serif"}} value="Lemonada">ليمونادة</option>
                    <option style={{fontFamily: "Mada', sans-serif"}} value="Mada">مدا</option>
                    <option style={{fontFamily: "Markazi Text', sans-serif"}} value="Markazi Text">مركزي</option>
                    <option style={{fontFamily: "Mehr Nastaliq', sans-serif"}} value="Mehr Nastaliq">مهر نستعلیق
                    </option>
                    <option style={{fontFamily: "Mirza', sans-serif"}} value="Mirza">میرزا‎</option>
                    <option style={{fontFamily: "Neo Sans Arabic', sans-serif"}} value="Neo Sans Arabic">نيو سانس
                    </option>
                    <option style={{fontFamily: "Noto Kufi Arabic', sans-serif"}} value="Noto Kufi Arabic">نوتو كوفي
                    </option>
                    <option style={{fontFamily: "Noto Naskh Arabic', sans-serif"}} value="Noto Naskh Arabic">نوتو
                        نسخ
                    </option>
                    <option style={{fontFamily: "Noto Nastaliq Urdu', sans-serif"}} value="Noto Nastaliq Urdu">نوتو
                        نستعليق اُردُو
                    </option>
                    <option style={{fontFamily: "Noto Sans Arabic', sans-serif"}} value="Noto Sans Arabic">نوتو سانس
                    </option>
                    <option style={{fontFamily: "Rakkas', sans-serif"}} value="Rakkas">رقَّاص</option>
                    <option style={{fontFamily: "Reem Kufi', sans-serif"}} value="Reem Kufi">ريم كوفي</option>
                    <option style={{fontFamily: "Rooznameh', sans-serif"}} value="Rooznameh">روزنامه</option>
                    <option style={{fontFamily: "Sahl Naskh', sans-serif"}} value="Sahl Naskh">سهل نسخ</option>
                    <option style={{fontFamily: "Scheherazade', sans-serif"}} value="Scheherazade">شهرزاد</option>
                    <option style={{fontFamily: "Shakstah', sans-serif"}} value="Shakstah">شكسته</option>
                    <option style={{fontFamily: "Simplified Arabic', sans-serif"}} value="Simplified Arabic">مبسَّط
                    </option>
                    <option style={{fontFamily: "Tajawal', sans-serif"}} value="Tajawal">تجوَّل</option>
                    <option style={{fontFamily: "Traditional Arabic', sans-serif"}}
                            value="Traditional Arabic">تقليدي
                    </option>
                    <option style={{fontFamily: "Urdu Typesetting', sans-serif"}} value="Urdu Typesetting">اُردُو
                    </option>
                    <option style={{fontFamily: "sans-serif', sans-serif"}} value="sans-serif">سانس سيرف</option>
                    <option style={{fontFamily: "Times New Roman', sans-serif"}} value="Times New Roman">تايمز نيو
                        رومان
                    </option>
                    <option style={{fontFamily: "Arial', sans-serif"}} value="Arial">اريال</option>
                    <option style={{fontFamily: "Calibri', sans-serif"}} value="Calibri">كالبري</option>
                    <option style={{fontFamily: "serif"}} value="Original">Original</option>
                </select>
                <span className="select-bar"/>
            </div>


            <div className="centered" style={{width: "80%"}}>
                <label className="label">Font Size:</label>
                <label className="value" id="sizeValue"/>
                <label className="pure-material-slider" style={{width: "95%"}} title="Change font size">
                    <input id="size" max="300" min="100" name="size" type="range"/>
                </label>
                <hr/>
            </div>


            <div className="centered" style={{width: "80%"}}>
                <label className="label">Line Height:</label>
                <label className="value" id="heightValue"></label>
                <label className="pure-material-slider" style={{width: "95%"}} title="Change line height">
                    <input id="height" max="300" min="100" name="height" type="range"/>
                </label>
                <hr/>
            </div>


            <div className="centered" style={{width: "80%"}} title="Website info">
                <img alt="Website Icon" height="32" id="websiteIcon" src="" width="32"/>
                <p id="website">Website</p>
            </div>
            <hr style={{width: "80%"}}/>


            <div className="centered" style={{width: "80%"}}>
                <label className="centered" id="whitelistedLabel" style={{fontSize: "1.3em"}}>
                    Running on this site</label>
            </div>
            <label className="material-switch centered">
                <input className="centered" id="whitelistSwitch" type="checkbox"/>
                <span title="Whitelist website"/>
            </label>
            <hr style={{width: "80%"}}/>


            <div className="centered" style={{width: "80%"}}>
                <label className="centered" id="overrideSettingsLabel" style={{fontSize: "1.3em"}}>
                    Using global settings</label>
            </div>
            <label className="material-switch centered">
                <input className="centered" id="overrideSettingsSwitch" type="checkbox"/>
                <span title="Use site specific settings"/>
            </label>
            <hr style={{width: "80%"}}/>


            <button className="material-button" id="importButton" title="Import settings from JSON file">Import
            </button>
            <input accept="application/json" id="importInput" type="file"/>
            <button className="material-button" id="exportButton" title="Export settings to JSON file">Export
            </button>
            <a id="exportAnchor"/>

            <br/>
            <br/>
        </div>

        <div className="centered">
            <a href="../custom_fonts.html" target="_blank">Custom Fonts (Beta)</a>
        </div>

        <div className="centered">
            <a href="https://github.com/basshelal/Wudooh/wiki" target="_blank">Help</a>
        </div>
        <div className="centered" style={{fontFamily: "Noto Nastaliq Urdu, Roboto Light, sans-serif"}}>
            <a href="https://github.com/basshelal/Wudooh" target="_blank">By Bassam Helal بسّام هلال</a>
        </div>
    </>)
}

createRoot(document.getElementById("root")!)
    .render(<React.StrictMode>
        <Popup/>
    </React.StrictMode>)

