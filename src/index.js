import { getAllByPlaceholderText } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom/client';

let root;

let input_field = document.getElementById("id_input_field");
input_field.addEventListener('change', getOperators);
let button_field = document.getElementById("button_accumulate");
button_field.addEventListener('click', calculateValue);

let tokens = [];
let tokenized = [];
let postfixed = [];
let opHistory = [];
let opResult = 0.0;

function getOperators(event){
  
  let str = input_field.value.replace(/ /g, '')

  let operations = '+-*/^=';
  let numeric = '0123456789.';
  let alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let bracket = '()';

  let state_prev = 0;
  let state_cur = 0;

  if(operations.includes(str[0]))
    state_prev = 0;
  else if (numeric.includes(str[0]))
    state_prev = 1;
  else if (alphabet.includes(str[0]))
    state_prev = 2;
  else if(bracket.includes(str[0]))
    state_prev = 3;
  
  state_cur = state_prev;


  tokens = [];
  let result = '';

  for(let i = 0; i < str.length; i++)
  {
    if(operations.includes(str[i]))
      state_cur = 0;
    else if (numeric.includes(str[i]))
      state_cur = 1;
    else if (alphabet.includes(str[i]))
      state_cur = 2;
    else if(bracket.includes(str[i]))
      state_cur = 3;

    if(state_cur !== state_prev)
    {
      tokens.push(result);
      result = str[i];

      state_prev = state_cur;
    } else if (state_cur === 0)
    {
      tokens.push(result);
      result = str[i];

      state_prev = state_cur;
    }else if (state_cur === 3)
    {
      tokens.push(result);
      result = str[i];

      state_prev = state_cur;
    } else
    {
      result += str[i];
    }
  }
  tokens.push(result);
  tokens.filter(n => n)

  let output = "";
  for(let i = 0; i < tokens.length; i++)
    output += tokens[i];
  document.getElementById('id_compiled_field_infix').innerHTML = output;

  toTokenized();
}

function toTokenized()
{
  tokenized = [];
  let operations = '+-*/^=';
  let numeric = '0123456789';
  let alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let bracket = '()';

  let state = -1;


  for(let i = 0; i < tokens.length; i++)
  {
    if(operations.includes(tokens[i][0]))
      state = 0;
    if(tokens[i].includes('.'))
      state = 1;
    else if (numeric.includes(tokens[i][0]))
      state = 2;
    else if (alphabet.includes(tokens[i][0]))
      state = 3;
    else if(bracket.includes(tokens[i][0]))
      state = 4;
      

    switch(state)
    {
      case 0: tokenized.push(`Служебный символ  ${tokens[i]} (${i})`); break;
      case 1: tokenized.push(`Константа Double  ${tokens[i]} (${i})`); break;
      case 2: tokenized.push(`Константа Integer ${tokens[i]} (${i})`); break;
      case 3: tokenized.push(`Идентификатор     ${tokens[i]} (${i})`); break;
      case 4: tokenized.push(`Служебный символ  ${tokens[i]} (${i})`); break;
      default: break;
    }
  }

  tokenized.sort();
  root = ReactDOM.createRoot(document.getElementById('div_tokens'));
  tokenized = tokenized.map(value => <li>{value}</li>);
  
  for(let i = 0; i < tokenized.length; i++)
    console.log(tokenized[i]);

  toPostFiX();
}

function toPostFiX()
{
  let opStack = []; // Стек для преобразования в постфиксную запись
  let result = [];  // Выходной список

  let operations = '+-*/^=';
  let numeric = '0123456789';
  let alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let bracket = '()';

  let prioritize = 
  {
    '(': 0,
    '=': 1,
    '+': 2,
    '-': 2,
    '/': 3,
    '*': 3,
    '^': 4,
  };
  
  let state = -1;

  for(let i = 0; i < tokens.length; i++)
  {
    if(operations.includes(tokens[i][0]))
      state = 0;
    if(tokens[i].includes('.'))
      state = 1;
    else if (numeric.includes(tokens[i][0]))
      state = 2;
    else if (alphabet.includes(tokens[i][0]))
      state = 3;
    else if(bracket.includes(tokens[i][0]))
      state = 4;

      if (state === 1 || state === 2 || state === 3)
      {
        result.push(tokens[i]);
      } else if (state === 4)
      {
        if(tokens[i][0] === '(')
        {
          opStack.push(tokens[i]);
        } else
        {
          let topToken = opStack.pop();
          while(topToken !== '(')
          {
            if(topToken !== '(' || topToken !== ')')
              result.push(topToken);
            topToken = opStack.pop();
          }
        }
      } else
      {
        while(opStack.length > 0 && prioritize[opStack[opStack.length-1]] >= prioritize[tokens[i]])
        {
          result.push(opStack.pop());
        }
        opStack.push(tokens[i]);
      }
    }
    while(opStack.length > 0)
        {
          result.push(opStack.pop());
          if(result[result.length-1] === '') result.pop();
        }

        
  postfixed = result;
  document.getElementById('id_compiled_field_postfix').innerHTML = result.join(' ');

  waitForInput();
}

function calculateValue()
{
  let operations = '+-*/^=';
  let numeric = '0123456789.';
  let alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let bracket = '()';
  opHistory = [];

  let counter = 0;
  let variables = [];

  postfixed.forEach(value => {if(alphabet.includes(value[0])) {counter++;variables.push(value);}; });
  
  for(let i = 1; i < counter; i++)
  {
    let name = 'var_' + variables[i];
    let value = document.getElementById(name).value;
    let id = postfixed.findIndex(value => value === variables[i]);
    postfixed[id] = value;
  }

  let stack = [];
  let result = 0;

  for(let i = 0; i < postfixed.length; i++)
  {
    if(operations.includes(postfixed[i]) && postfixed[i] !== '=')
    {
      let first = Number(stack.pop());
      let second =  Number(stack.pop());
      switch(postfixed[i])
      {
        case '+': stack.push (first+second); result = first+second; opHistory.push(`${second} + ${first} = ${result}`); break;
        case '-': stack.push (second-first); result = second-first; opHistory.push(`${second} - ${first} = ${result}`); break;
        case '*': stack.push (first*second); result = first*second; opHistory.push(`${second} * ${first} = ${result}`); break;
        case '/': if(first === 0) {alert('Деление на 0! Ошибка в вычислениях.')};stack.push(second/first); result = second/first; opHistory.push(`${second} / ${first} = ${result}`); break; 
        case '^': stack.push (Math.pow(second,first)); result = Math.pow(second,first); opHistory.push(`${second} ^ ${first} = ${result}`); break;
        default: break;
      }
    } else if (numeric.includes(postfixed[i][0]))
    {
      stack.push(postfixed[i]);
    }
  }
  if(stack.length === 1) result = stack.pop();
  document.getElementById('id_result_field').innerHTML = result;
  opResult = result;

  opHistory.map(value => <li>value</li>);
  opHistory = opHistory.map(value => <li>{value}</li>);

  root.render(
    <div id = 'div_tokenized'>
      <h2>Таблица литералов</h2><ul>{tokenized}</ul>
      <h2>Порядок операций</h2><ul>{opHistory}</ul>
    </div>
  )
}

function waitForInput()
{
  document.getElementById('div_variables').innerHTML = "";
  let alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let counter = 0;
  let variables = [];

  postfixed.forEach(value => {if(alphabet.includes(value[0])) {counter++;variables.push(value);}; });
  for(let i = 1; i < counter; i++)
  {
    let name = 'var_' + variables[i];
    if(document.getElementById(name) >= 0)
    {
      let create_name = document.createElement('p');
      create_name.innerHTML = name;
      document.getElementById('div_variables').appendChild(create_name);
      let create_field = document.createElement('input');
      create_field.id = name;
      document.getElementById('div_variables').appendChild(create_field);
    }
  }
}