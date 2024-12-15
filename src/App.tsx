import { useState } from 'react';
import './App.css'
import { useForm } from 'react-hook-form';

type FreqMap = { [key: string]: number };

type Inputs = {
    text: string
    key: string
}


const RUSSIAN_FREQ: { [key: string]: number } = {
    'а': 0.062, 'б': 0.014, 'в': 0.038, 'г': 0.013, 'д': 0.025,
    'е': 0.072, 'ж': 0.007, 'з': 0.016, 'и': 0.062, 'й': 0.010,
    'к': 0.028, 'л': 0.035, 'м': 0.026, 'н': 0.053, 'о': 0.090,
    'п': 0.023, 'р': 0.040, 'с': 0.045, 'т': 0.053, 'у': 0.021,
    'ф': 0.002, 'х': 0.009, 'ц': 0.003, 'ч': 0.012, 'ш': 0.006,
    'щ': 0.003, 'ъ': 0.014, 'ы': 0.016, 'ь': 0.014, 'э': 0.003,
    'ю': 0.006, 'я': 0.018
};

const RUSSIAN_ALPHABET = 'абвгдежзийклмнопрстуфхцчшщъыьэюя';
const LATIN_ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

function App() {
  const preprocessText = (text: string): string => {
    // Заменяем 'ё' и 'Ё' на 'е' и приводим текст к нижнему регистру
    text = text.replace(/ё/gi, 'е').toLowerCase();
    
    // Разрешенные символы
    const allowedLetters = RUSSIAN_ALPHABET + LATIN_ALPHABET;
    
    // Фильтруем символы, оставляя только разрешенные
    text = [...text].filter(letters => allowedLetters.includes(letters)).join('');
    
    return text;
  };

  const shiftChar = (letter: string, shift: number): string => {
    let alpha: string;
    let rangeSize: number;

    if (RUSSIAN_ALPHABET.includes(letter)) {
        alpha = RUSSIAN_ALPHABET;
        rangeSize = 32;
    } else if (LATIN_ALPHABET.includes(letter)) {
        alpha = LATIN_ALPHABET;
        rangeSize = 26;
    } else {
        return letter; // Возвращаем символ как есть, если он не в алфавите
    }

    shift = shift % rangeSize; // Учитываем циклический сдвиг
    const index = alpha.indexOf(letter); // Находим индекс символа
    return alpha[(index + shift + rangeSize) % rangeSize]; // Возвращаем сдвинутый символ
  };

  const vigenereEncrypt = (text: string, key: string): string => {
    key = preprocessText(key);
    if (!key) return text; // Если ключ пустой, возвращаем текст без изменений

    const encryptedArray: string[] = [];
    const keyLength = key.length;
    let keyIndex = 0;

    for (const letter of text) {
      // Определяем, в каком алфавите находится символ
      if (!RUSSIAN_ALPHABET.includes(letter) && !LATIN_ALPHABET.includes(letter)) {
        encryptedArray.push(letter); // Если символ не в алфавите, добавляем его в результат
      }

      const keyChar = key[keyIndex % keyLength]; // Получаем соответствующий символ из ключа
      let shift: number;

      // Находим сдвиг для ключевого символа
      if (RUSSIAN_ALPHABET.includes(keyChar)) {
          shift = RUSSIAN_ALPHABET.indexOf(keyChar);
      } else if (LATIN_ALPHABET.includes(keyChar)) {
          shift = LATIN_ALPHABET.indexOf(keyChar);
      } else {
          shift = 0; // Если символ не в алфавите, сдвиг 0
      }

      const encryptedLetter = shiftChar(letter, shift); // Шифруем символ
      encryptedArray.push(encryptedLetter); // Добавляем зашифрованный символ в результат
      keyIndex++; // Увеличиваем индекс ключа
    }

    return encryptedArray.join(''); // Возвращаем зашифрованный текст как строку
  };

  const vigenereDecrypt = (text: string, key: string): string => {
    key = preprocessText(key);
    if (!key) return text; // Если ключ пустой, возвращаем текст без изменений

    const decryptedArray: string[] = [];
    const keyLength = key.length;
    let keyIndex = 0;

    for (const letter of text) {

        // Определяем, в каком алфавите находится символ
        if (!RUSSIAN_ALPHABET.includes(letter) && !LATIN_ALPHABET.includes(letter)) {
          decryptedArray.push(letter); // Если символ не в алфавите, добавляем его в результат
        }

        const k = key[keyIndex % keyLength]; // Получаем соответствующий символ из ключа
        let shift: number;

        // Находим сдвиг для ключевого символа
        if (RUSSIAN_ALPHABET.includes(k)) {
            shift = RUSSIAN_ALPHABET.indexOf(k);
        } else if (LATIN_ALPHABET.includes(k)) {
            shift = LATIN_ALPHABET.indexOf(k);
        } else {
            shift = 0; // Если символ не в алфавите, сдвиг 0
        }

        const dec = shiftChar(letter, -shift); // Дешифруем символ (сдвиг в обратном направлении)
        decryptedArray.push(dec); // Добавляем расшифрованный символ в результат
        keyIndex++; // Увеличиваем индекс ключа
    }

    return decryptedArray.join(''); // Возвращаем расшифрованный текст как строку
  };

  const groupFive = (text: string): string => {
    text = text.replace(' ', ''); // Удаляем все пробелы
    const grouped: string[] = [];

    for (let i = 0; i < text.length; i += 5) {
        grouped.push(text.slice(i, i + 5)); // Извлекаем подстроки длиной 5
    }

    return grouped.join(' '); // Соединяем подстроки пробелом
  };

  const frequencyAnalysis = (text: string): { [key: string]: number } => {
    const frequencyList: { [key: string]: number } = {};

    for (const letter of text) {
        frequencyList[letter] = (frequencyList[letter] || 0) + 1; // Увеличиваем счетчик для каждого символа
    }

    const total = Object.values(frequencyList).reduce((sum, count) => sum + count, 0); // Суммируем все частоты

    if (total === 0) {
        return {}; // Если общее количество равно 0, возвращаем пустой объект
    }

    // Делим частоту каждого символа на общее количество
    for (const frequency in frequencyList) {
        frequencyList[frequency] /= total;
    }

    return frequencyList; // Возвращаем объект с частотами
  };

  const leastSquaresMethod = (frequencies: { [key: string]: number }, expectedFrequencies: { [key: string]: number }): number => {
    let error = 0;

    for (const letter in frequencies) {
        const expected = expectedFrequencies[letter] || 0; // Получаем ожидаемую частоту или 0, если ее нет
        error += Math.pow(frequencies[letter] - expected, 2); // Увеличиваем ошибку на квадрат разности
    }

    return error; // Возвращаем общую ошибку
  };

  const myGCD = (a: number, b: number): number => {
    while (b !== 0) {
        const temp = b; // Сохраняем значение b во временной переменной
        b = a % b;     // Обновляем b как остаток от деления a на b
        a = temp;      // Обновляем a как предыдущее значение b
    }
    return a; // Возвращаем наибольший общий делитель
  };

  const findRepeatedSequences = (text: string, seqLen: number = 3): { [key: string]: number[] } => {
    const sequences: { [key: string]: number[] } = {}; // Объект для хранения последовательностей и их позиций
    const length = text.length;

    // Проходим по длинам подстрок от seqLen до половины длины текста
    for (let lengthSubseq = seqLen; lengthSubseq <= Math.floor(length / 2); lengthSubseq++) {
        for (let i = 0; i <= length - lengthSubseq; i++) {
            const sequence = text.substring(i, i + lengthSubseq); // Получаем подстроку
            const j = text.indexOf(sequence, i + 1); // Ищем повтор

            if (j !== -1) { // Если нашли повтор
                if (!sequences[sequence]) {
                    sequences[sequence] = []; // Инициализируем массив для новой последовательности
                }
                sequences[sequence].push(i); // Добавляем текущую позицию
                sequences[sequence].push(j); // Добавляем позицию повтора
            }
        }
    }

    // Оставляем только последовательности, которые встречаются более одного раза
    return Object.fromEntries(
        Object.entries(sequences).filter(([_, positions]) => positions.length > 1)
    );
  };

  const kasiskiExamination = (text: string): number => {
    const sequences = findRepeatedSequences(text); // Находим повторяющиеся последовательности
    const distances: number[] = [];

    for (const positions of Object.values(sequences)) {
        for (let i = 0; i < positions.length - 1; i++) {
            const dist = positions[i + 1] - positions[i]; // Вычисляем расстояние между повторами
            distances.push(dist);
        }
    }

    if (distances.length === 0) {
        return 1; // Если не найдено расстояний, возвращаем 1
    }

    const possibleLengths: number[] = [];

    for (let i = 0; i < distances.length; i++) {
        for (let j = i + 1; j < distances.length; j++) {
            const g = myGCD(distances[i], distances[j]); // Находим НОД
            if (g > 1) {
                possibleLengths.push(g); // Добавляем, если НОД больше 1
            }
        }
    }

    if (possibleLengths.length === 0) {
        return 1; // Если не найдено возможных длин, возвращаем 1
    }

    // Подсчитываем частоту длин
    const lengthFrequency: { [key: number]: number } = {};

    for (const lengthVal of possibleLengths) {
        lengthFrequency[lengthVal] = (lengthFrequency[lengthVal] || 0) + 1;
    }

    let maxCount = 0;
    let likelyLength = 1;

    for (const [key, value] of Object.entries(lengthFrequency)) {
        if (value > maxCount) {
            maxCount = value;
            likelyLength = Number(key); // Обновляем вероятную длину
        }
    }

    return likelyLength; // Возвращаем наиболее вероятную длину
  };

  const breakVigenere = (text: string): [string, string] => {

    if (!text) {
        return ["", text];
    }

    let keyLength = kasiskiExamination(text);
    if (keyLength < 1) {
        keyLength = 1;
    }

    const bestShiftForColumn = (columnText: string, expectedFreq: FreqMap): number => {
        if (!columnText) {
            return 0;
        }

        let bestErr = Infinity;
        let bestShift = 0;
        const alpha = RUSSIAN_ALPHABET;

        for (let s = 0; s < alpha.length; s++) {
            const decCol = columnText.split('').map(c => shiftChar(c, -s)).join('');
            const decFreq = frequencyAnalysis(decCol);

            if (!decFreq || Object.keys(decFreq).length === 0) { // Если пусто, значит колонка пуста или некорректна
                continue;
            }

            const err = leastSquaresMethod(decFreq, expectedFreq);
            if (err < bestErr) {
                bestErr = err;
                bestShift = s;
            }
        }

        return bestShift;
    };

    // Если текст очень короткий, нет смысла взламывать
    if (text.length < 5) {
        // Предположим ключ длины 1, но предупредим
        return ["а", vigenereDecrypt(text, "а")];
    }

    const columns = Array.from({ length: keyLength }, (_, j) =>
        text.split('').filter((_, i) => i % keyLength === j).join('')
    );

    // Проверяем, что колонки не пустые
    if (!columns.every(col => col.length > 0)) {
        // Если слишком малая длина ключа или странный текст
        return ["а", vigenereDecrypt(text, "а")];
    }

    // Должен соответствовать типу number[]
    const shifts = columns.map(col => bestShiftForColumn(col, RUSSIAN_FREQ));

    // Формируем ключ из сдвигов
    const key = shifts.map(s => RUSSIAN_ALPHABET[s]).join('');
    const decryptedText = vigenereDecrypt(text, key);

    return [key, decryptedText];
  };

  const {register, watch} = useForm<Inputs>()

  const [error, setError] = useState('')
  const [result, setResult] = useState('')
  
  const handleEncrypt = () => {
    const initText = watch('text')
    const key = watch('key')
    console.log(initText, key);

    if (!initText) {
        setError('Введите текст для шифрования')
        return
    }
    if (!key) {
        setError('Введите ключ для шифрования')
        return
    }

    const text = preprocessText(initText)

    if (!text) {
        setError('После обработки текста не осталось символов, попробуйте другой текст.')
        return
    }

    const result = groupFive(vigenereEncrypt(text, key))
    return setResult(result)
  }

  const handleDecrypt = () => {
    const initText = watch('text')
    const key = watch('key')
    console.log(initText, key);

    if (!initText) {
        setError('Введите текст для расшифрования')
        return
    }
    if (!key) {
        setError('Введите ключ для расшифрования')
        return
    }

    const text = preprocessText(initText)
    if (!text) {
        setError('После обработки текста не осталось символов, попробуйте другой текст.')
        return
    }

    const result = groupFive(vigenereDecrypt(text, key))
    return setResult(result)
  }

  const handleBreak = () => {
    const initText = watch('text')

    if (!initText) {
        setError('Введите текст для взлома')
        return
    }
    
    const text = preprocessText(initText)
    if (!text) {
        setError('После обработки текста не осталось символов, попробуйте другой текст.')
        return
    }
    if (text.length < 3) {
        setError('Для анализа недостаточно символов')
        return
    }

    const [key, decryptedText] = breakVigenere(text)
    
    return setResult(`Результат взлома: ${groupFive(decryptedText)}, \n 
    предполагаемый ключ: ${key? key : 'Для определения ключа недостаточно данных'}`)
  }

  return (
    <div className='flex flex-col gap-[20px]'>
      <h1 className='text-[60px]'>Шифр Вижинера</h1>
      <div className="flex justify-between gap-[15px]">
        <h2 className='text-[30px]'>Текст</h2>
        <textarea {...register("text", { required: true })} className='flex-grow h-[80px] px-[10px]'/>
      </div>
      <div className="flex justify-between gap-[15px]">
        <h2 className='text-[30px]'>Ключ</h2>
        <input {...register("key", { required: true })} className='flex-grow px-[10px]'/>
      </div>
      <div className="flex justify-center gap-[15px]">
        <button onClick={(e) => {
            e.preventDefault()
            setError('')
            setResult('')
            handleEncrypt()
            }}>
            Зашифровать
        </button>
        <button onClick={(e) => {
            e.preventDefault()
            setError('')
            setResult('')
            handleDecrypt()
            }}>
            Расшифровать
        </button>
        <button onClick={(e) => {
            e.preventDefault()
            setError('')
            setResult('')
            handleBreak()
            }}>
            Взломать
        </button>
      </div>
      <div className="max-w-[80%] whitespace-pre-line mx-auto">
        {error}
        {result}
      </div>
    </div>
  )
}

export default App
