import { fontSize } from '@mui/system';
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import './textArea.css'

export const TextArea = forwardRef(({ maxLength, minLength, style, placeholder, 
    defaultText, warning, reference, getText } , ref) => {

    const [currentTextLength, setCurrentTextLength] = useState(defaultText ? defaultText.length : 0);
    const [text, setText] = useState(defaultText ? defaultText : "");

    const handleChange = (e) => {
        setCurrentTextLength(e.target.value.length);
        setText(e.target.value);
        // console.log(getText);
        getText(e.target.value);
    }


    return (
        <div className='textarea-main'  >
            <textarea
                maxLength={maxLength}
                minLength={minLength}
                placeholder={placeholder}
                autoCorrect='off'
                autoComplete='off'
                autoCapitalize='off'
                defaultValue={defaultText}
                onChange={handleChange}
                style={style}
                ref={reference}
            >
            </textarea>
            <div className='textarea-footer'>
                <div className='warning'>
                    {warning}
                </div>
                <div className='textarea-label'>

                    {currentTextLength} / {maxLength} max
                </div>
            </div>
        </div>
    )
})
