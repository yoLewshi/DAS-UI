import React, {memo, useContext, useEffect, useState} from 'react';
import { GlobalContext } from '../../shared_components/globalContext';
import { getValue, setValue } from '../../shared_methods/cache';


import classNames from 'classnames/bind';
import styles from "./style.module.css";
let cx = classNames.bind(styles);

function ThemeToggle(props) {

    const {cssClasses} = props || [];
    const { global, setGlobal } = useContext(GlobalContext);
    const [theme, setTheme] = useState(getValue("theme") || "default");

    function toggleTheme() {
        setTheme((prevValue) => {
            return prevValue == "default" ? "dark" : "default";
        })
    }

    useEffect(() => {
        setGlobal(Object.assign({}, global, {theme: theme}));
        setValue("theme", theme);

        if(theme == "default") {
            document.querySelector("body").classList.remove("dark")
        } else {
            document.querySelector("body").classList.add("dark")
        }
        
    }, [theme])

    return (  
        <div className={cx(["theme_toggle"].concat(cssClasses))}>
            {theme == "default" ? 
            <i className="bi bi-toggle-off" onClick={toggleTheme}></i>
            : <i className="bi bi-toggle-on" onClick={toggleTheme}></i>
            }
        </div>
    )
};

export default memo(ThemeToggle);