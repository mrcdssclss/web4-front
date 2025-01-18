import {useContext, useState} from "react";
import {useNavigate} from "react-router-dom";
import {UserContext} from "../UserContext";
import "./styles/LoginRegisterPage.css"

export default function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const {login} = useContext(UserContext);
    const navigate = useNavigate();

    function handleClickNext(){
        sendLogin(email, password);
    }
    function handleClickBack(){
        navigate("/");
    }

    function sendLogin(email, password){
        const isLogin = false
        return fetch('/api/main/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password, isLogin}),
        })
            .then(
                response => response.json()
            )
            .then(json => {
                if (json.login) {
                    login(json)
                    navigate("/main")
                } else {
                    document.getElementById("loginStatus").innerText = "неверный логин или пароль"
                }
            })
    }
    return (<div className="login-form">
            <button className="BackButton" onClick={handleClickBack}>Вернуться</button>
            <h2>Вход</h2>
            <input id="email"
                   type="email"
                   placeholder="Email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   required/>
            <input id="password"
                   type="password"
                   placeholder="Password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required/>
            <button className="LoginButton" onClick={handleClickNext}>Вход</button>
            <div>
                <h4 id="loginStatus"> </h4>
            </div>

        </div>
    )
}



