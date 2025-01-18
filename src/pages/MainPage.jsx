import {UserContext} from "../UserContext";
import {useContext, useEffect, useState} from "react";
import LogOutButton from "../components/LogOutButton";
import "../pages/styles/MainPage.css"

export default function MainPage() {
    const {currentUser} = useContext(UserContext);
    return (<div>
        {(currentUser != null) ? (
            <>
                <div className="logout-button"><LogOutButton/></div>
                <Page/>
            </>
        ) : (
            <div>
                <p>вы не вошли в систему</p>
            </div>
        )}
    </div>)
}

function Page() {
    const {currentUser} = useContext(UserContext);
    const email = currentUser?.email;
    const password = currentUser?.password;
    const isLogin = true
    const [r, setR] = useState(1);
    loginned()
    function loginned() {
        fetch('api/points/getpoint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email, password, isLogin}),
        }).then(response => {
            if (!response.ok) {
                throw new Error('ERROR response.');
            }
            return response.json();
        })
            .then(json => {
                sessionStorage.setItem("points", JSON.stringify(json));
                const table = document.getElementById("results-table");
                while (table.rows.length > 1) {
                    table.deleteRow(1);
                }
                json.forEach((point) => {
                    insertTable(point.x, point.y, point.r, point.hit, point.executionTime, point.serverTime);
                });
            })
    }

    function handleCheck() {
        const x = document.getElementById("selectorX").value
        const y = document.getElementById("inputY").value
        const r = document.getElementById("selectorR").value
        if (isNaN(x) || x>5 || x <-3) {
            document.getElementsByName("Xstatus").innerText = "некорректное значение для X"
            return
        }
        if (isNaN(y) || y>3 || y <-5) {
            document.getElementsByName("Xstatus").innerText = "некорректное значение для Y"
            return
        }
        if (isNaN(y) || y>5 || y <-3) {
            document.getElementsByName("Xstatus").innerText = "некорректное значение для R"
            return
        }
        checkPoint(x, y, r)
    }
    const handleRChange = (event) => {
        const svgElement = document.getElementById('graph');
        const circles = Array.from(svgElement.getElementsByTagName('circle'));
        const newR = parseFloat(event.target.value)
        setR(newR);
        circles.slice(1).forEach(circle => {
            svgElement.removeChild(circle);
        });

        const pointsString = sessionStorage.getItem("points");
        if (pointsString) {
            try {
                const points = JSON.parse(pointsString);
                points.forEach((point) => {
                    const pointR = parseFloat(point.r);
                    if (pointR === parseFloat(newR.toString())) {
                        draw(point.x, point.y, point.r, point.hit);
                    }
                });
            } catch (error) {
                console.error("Ошибка парсинга JSON из sessionStorage:", error)
                sessionStorage.removeItem("points")
            }
        } else {
            console.log("Точки не найдены в sessionStorage");
        }
        GraphWithControls(newR)
    };

    function draw(x, y, r, answer){
        const svg = document.getElementById("graph");
        let scale = 163 * Math.abs(r)
        const centerX = 350;
        const centerY = 250;

        const xSVG = centerX + (x * scale);
        const ySVG = centerY - (y * scale);

        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", xSVG.toFixed(2));
        circle.setAttribute("cy", ySVG.toFixed(2));
        circle.setAttribute("r", "2");
        circle.setAttribute("class", "circles");
        circle.setAttribute("fill", answer ? "pink" : "#8F4A46");
        svg.appendChild(circle);
    }

    function checkPoint(x, y, r) {
        fetch('api/points/check-point', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({x, y, r, email}),
        }).then(response => {
            return response.json();
        }).then(json => {
            let points = sessionStorage.getItem("points");
            if (points) {
                points = JSON.parse(points);
            } else {
                points = [];
            }
            points.push(json);
            sessionStorage.setItem("points", JSON.stringify(points));
            const r = json.r;
            const x = json.x;
            const y = json.y;

            draw(x, y, r, json.hit)
            document.getElementById("selectorX").value = Math.round(x).toString()
            document.getElementById("inputY").value = Math.round(y).toString()

            insertTable(json.x, json.y, json.r, json.hit, json.executionTime, json.serverTime);
        });
    }

    function insertTable(x, y, r, isHit, executionTime, serverTime){
        const table = document.getElementById("results-table");
        const newRow = table.insertRow();
        const xCell = newRow.insertCell(0);
        const yCell = newRow.insertCell(1);
        const rCell = newRow.insertCell(2);
        const answerCell = newRow.insertCell(3);
        const executionTimeCell = newRow.insertCell(4);
        const serverTimeCell = newRow.insertCell(5);

        xCell.innerText = x;
        yCell.innerText = y;
        rCell.innerText = r;
        answerCell.innerText = isHit;
        executionTimeCell.innerText = executionTime;
        serverTimeCell.innerText = serverTime;

        const container = document.getElementById("results-table-container")
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
            }, 0);
    }

    useEffect(() => {
        const svgElement = document.getElementById("graph");

        const click = (event) => {
            const r = parseFloat(document.getElementById("selectorR").value);
            const point = svgElement.createSVGPoint();
            point.x = event.clientX;
            point.y = event.clientY;
            const svgCoords = point.matrixTransform(svgElement.getScreenCTM().inverse());

            const centerX = 350
            const centerY = 250
            const scale = 163 * Math.abs(r)
            const x = ((svgCoords.x - centerX) / scale).toFixed(2)
            const y = (-((svgCoords.y - centerY) / scale)).toFixed(2)
            console.log(x, y)

            checkPoint(x, y, r);
        };

        svgElement.addEventListener('click', click);

        return () => {
            svgElement.removeEventListener('click', click);
        };
        }, [checkPoint]);

    function GraphWithControls(r){
        const defaultText = "?";
        const updateLabel = (selector, value) => {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = isNaN(value) ? defaultText : value.toString();
            }
        }
        updateLabel("text[x='427']", r / 2);
        updateLabel("text[x='510']", r);
        updateLabel("text[x='178']", -r);
        updateLabel("text[x='256']", -r / 2);
        updateLabel("text[y='161']", r / 2);
        updateLabel("text[y='78']", r);
        updateLabel("text[y='327']", -r / 2);
        updateLabel("text[y='410']", -r);
    }
        return (<div className="main-container">
            <section className="block plot-section">
                <div className="graphic">
                    <svg id="graph" height="500" width="700" xmlns="http://www.w3.org/2000/svg">
                        <circle id="round" cx="350" cy="250" r="83" fill="#8F4A46" fillOpacity="0.6"/>
                        <rect id="rect1" x="266" y="166" width="83" height="83" fill="#DEBDBB" fillOpacity="1"/>
                        <rect id="rect2" x="350" y="83" width="83" height="332" fill="#DEBDBB" fillOpacity="1"/>

                        <rect id="rect3" x="350" y="85" width="166" height="166" fill="#8F4A46" fillOpacity="0.6"/>

                        <polygon id="triangle" points="350,250 515,250 350,332" fill="#8F4A46" fillOpacity="0.6"/>


                        <line stroke="#2B465E" x1="100" x2="600" y1="250" y2="250"></line>
                        <line stroke="#2B465E" x1="350" x2="350" y1="0" y2="500"></line>
                        <polygon fill="white" points="350,0 344,15 356,15" stroke="white"></polygon>
                        <polygon fill="white" points="600,250 585,256 585,244" stroke="white"></polygon>

                        <line stroke="#2B465E" x1="432" x2="432" y1="255" y2="245"></line>
                        <line stroke="#2B465E" x1="515" x2="515" y1="255" y2="245"></line>

                        <line stroke="#2B465E" x1="183" x2="183" y1="255" y2="245"></line>
                        <line stroke="#2B465E" x1="266" x2="266" y1="255" y2="245"></line>

                        <line stroke="#2B465E" x1="345" x2="355" y1="166" y2="166"></line>
                        <line stroke="#2B465E" x1="345" x2="355" y1="83" y2="83"></line>

                        <line stroke="#2B465E" x1="345" x2="355" y1="332" y2="332"></line>
                        <line stroke="#2B465E" x1="345" x2="355" y1="415" y2="415"></line>

                        <text fill="white" x="427" y="240">R/2</text>
                        <text fill="white" x="510" y="240">R</text>

                        <text fill="white" x="178" y="240">-R</text>
                        <text fill="white" x="256" y="240">-R/2</text>

                        <text fill="white" x="360" y="161">R/2</text>
                        <text fill="white" x="360" y="78">R</text>

                        <text fill="white" x="360" y="327">-R/2</text>
                        <text fill="white" x="360" y="410">-R</text>

                        <text fill="white" x="360" y="10">Y</text>
                        <text fill="white" x="590" y="240">X</text>
                    </svg>
                </div>
            </section>
            <div className="selectors">
                <div>
                    <select id="selectorX">
                        <option value="">Выберите X</option>
                        <option value="-3">-3</option>
                        <option value="-2">-2</option>
                        <option value="-1">-1</option>
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </div>
                <div>
                    <input id="inputY" type="range" min="-5" max="5" step="1"/>
                </div>
                <div>
                    <select id="selectorR" value={r} onChange={handleRChange}>
                        <option value="-3">-3</option>
                        <option value="-2">-2</option>
                        <option value="-1">-1</option>
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </div>
                <h4 id="Xstatus"></h4>
                <h4 id="Ystatus"></h4>
                <h4 id="Rstatus"></h4>
            </div>
            <button id="value-button" onClick={handleCheck}>проверить</button>
            <div id="results-table-container">
                <table id="results-table">
                    <thead>
                    <tr>
                        <th>X</th>
                        <th>Y</th>
                        <th>R</th>
                        <th>Result</th>
                        <th>ExecutionTime</th>
                        <th>ServerTime</th>
                    </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
        </div>)
}