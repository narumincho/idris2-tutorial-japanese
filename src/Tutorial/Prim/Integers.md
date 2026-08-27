# 整数 (Integers)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Prim/Integers.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Prim/Integers.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.Prim.Integers

import Data.Bits
import Data.String

%default total
```

本章の冒頭で列挙したように、Idris はさまざまな固定精度の符号付き・符号なし整数型、および任意精度符号付き整数型 `Integer` を提供しています。これらすべてに以下のプリミティブ関数が用意されています（ここでは `Bits8` を例として示します）：

- `prim__add_Bits8`: 整数の加算。
- `prim__sub_Bits8`: 整数の減算。
- `prim__mul_Bits8`: 整数の乗算。
- `prim__div_Bits8`: 整数の除算。
- `prim__mod_Bits8`: 剰余（モジュロ）関数。
- `prim__shl_Bits8`: ビット単位の左シフト。
- `prim__shr_Bits8`: ビット単位の右シフト。
- `prim__and_Bits8`: ビット単位の論理積（*AND*）。
- `prim__or_Bits8`: ビット単位の論理和（*OR*）。
- `prim__xor_Bits8`: ビット単位の排他的論理和（*XOR*）。

通常、加算と乗算の関数は `Num` インターフェースの演算子を通じて、減算の関数は `Neg` インターフェースを通じて、除算関数（`div` と `mod`）は `Integral` インターフェースを通じて利用します。ビット演算は `Data.Bits.Bits` および `Data.Bits.FiniteBits` インターフェースを通じて利用可能です。

すべての整数型において、数値演算に対して以下の法則が成り立つと仮定されています（`x`、`y`、`z` は同一のプリミティブ整数型の任意の値）：

- `x + y = y + x`: 加算の可換性（交換法則）。
- `x + (y + z) = (x + y) + z`: 加算の結合法則。
- `x + 0 = x`: 0 は加算の単位元。
- `x - x = x + (-x) = 0`: `-x` は `x` の加法逆元。
- `x * y = y * x`: 乗算の可換性（交換法則）。
- `x * (y * z) = (x * y) * z`: 乗算の結合法則。
- `x * 1 = x`: 1 は乗算の単位元。
- `x * (y + z) = x * y + x * z`: 分配法則。
- `` y * (x `div` y) + (x `mod` y) = x ``（`y /= 0` の場合）。

公式にサポートされているバックエンドでは、`mod` の計算に **ユークリッド剰余（Euclidian modulus）** を使用している点に注意してください。`y /= 0` の場合、`` x `mod` y `` は常に `abs y` より真に小さい非負の値となり、上記の法則が成り立ちます。`x` または `y` が負の数の場合、これは他の多くの言語の動作と異なりますが、[こちらの論文](https://www.microsoft.com/en-us/research/publication/division-and-modulus-for-computer-scientists/) で説明されているように妥当な理由があります。

## 符号なし整数 (Unsigned Integers)

符号なし固定長整数型（`Bits8`、`Bits16`、`Bits32`、`Bits64`）は、すべての整数インターフェース（`Num`、`Neg`、`Integral`）およびビット演算の 2 つのインターフェース（`Bits`、`FiniteBits`）の実装を備えています。`div` と `mod` を除くすべての関数は全域（total）です。オーバーフローは `2^bitsize` を法とする剰余を計算することによって処理されます。例えば `Bits8` の場合、すべての演算は 256 を法として結果を計算します：

```repl
Main> the Bits8 255 + 1
0
Main> the Bits8 255 + 255
254
Main> the Bits8 128 * 2 + 7
7
Main> the Bits8 12 - 13
255
```

## 符号付き整数 (Signed Integers)

符号なし整数型と同様に、符号付き固定長整数型（`Int8`、`Int16`、`Int32`、`Int64`）もすべての整数インターフェースおよびビット演算インターフェース（`Bits`、`FiniteBits`）の実装を備えています。オーバーフローは `2^bitsize` を法とする剰余を計算し、結果がまだ範囲外の場合は `2^bitsize` を減算することによって処理されます。例えば `Int8` の場合、すべての演算は 256 を法として結果を計算し、範囲外であれば 256 を引きます：

```repl
Main> the Int8 2 * 127
-2
Main> the Int8 3 * 127
125
```

## ビット演算 (Bitwise Operations)

`Data.Bits` モジュールは、整数型に対するビット単位の演算を行うためのインターフェースをエクスポートしています。ビット演算に馴染みのない読者のために、8 ビット符号なし整数（`Bits8`）を使った例をいくつか紹介します。これは符号付き整数よりも符号なし整数の方がはるかに直感的に理解しやすい点に注意してください。符号付き整数はビットパターンに数値の「符号（正負）」の情報を含める必要があり、Idris の符号付き整数は [2 の補数表現](https://ja.wikipedia.org/wiki/2%E3%81%AE%E8%A3%9C%E6%95%B0) を使用していると想定されています。

8 ビット符号なし 2 進数は、内部的には 8 個のビット（0 または 1 の値）のシーケンスとして表現され、それぞれのビットが 2 の累乗に対応しています。例えば、数値 23（= 16 + 4 + 2 + 1）は `0001 0111` として表現されます：

```repl
23 (2進数):       0  0  0  1    0  1  1  1

ビット位置:        7  6  5  4    3  2  1  0
10進数値:        128 64 32 16    8  4  2  1
```

`testBit` 関数を使って、指定した位置のビットが立っている（1 である）かどうかを判定できます：

```repl
Tutorial.Prim> testBit (the Bits8 23) 0
True
Tutorial.Prim> testBit (the Bits8 23) 1
True
Tutorial.Prim> testBit (the Bits8 23) 3
False
```

同様に、`setBit` や `clearBit` 関数を使って、特定の位置のビットを立てたり（1 にする）クリアしたり（0 にする）できます：

```repl
Tutorial.Prim> setBit (the Bits8 23) 3
31
Tutorial.Prim> clearBit (the Bits8 23) 2
19
```

また、整数値に対するブール演算を行うための演算子 `(.&.)`（ビット積 / AND）、`(.|.)`（ビット和 / OR）、および関数 `xor`（排他的論理和 / XOR）もあります。例えば `x .&. y` は `x` と `y` の両方で立っているビットのみが立ち、`x .|. y` は `x` または `y`（またはその両方）で立っているすべてのビットが立ち、`` x `xor` y `` は 2 つの値のいずれか一方のみで立っているビットが立ちます：

```repl
23 (2進数):            0  0  0  1    0  1  1  1
11 (2進数):            0  0  0  0    1  0  1  1

23 .&. 11 (2進数):     0  0  0  0    0  0  1  1
23 .|. 11 (2進数):     0  0  0  1    1  1  1  1
23 `xor` 11 (2進数):   0  0  0  1    1  1  0  0
```

REPL での実行例は以下のとおりです：

```repl
Tutorial.Prim> the Bits8 23 .&. 11
3
Tutorial.Prim> the Bits8 23 .|. 11
31
Tutorial.Prim> the Bits8 23 `xor` 11
28
```

最後に、`shiftR` および `shiftL` 関数を使用して、すべてのビットを指定されたステップ数だけ右または左にシフトすることができます（あふれたビットは単純に切り捨てられます）。したがって、左シフトは 2 の累乗による乗算と見なすことができ、右シフトは 2 の累乗による除算と見なすことができます：

```repl
22 (2進数):              0  0  0  1    0  1  1  0

22 `shiftL` 2 (2進数):   0  1  0  1    1  0  0  0
22 `shiftR` 1 (2進数):   0  0  0  0    1  0  1  1
```

REPL での実行例：

```repl
Tutorial.Prim> the Bits8 22 `shiftL` 2
88
Tutorial.Prim> the Bits8 22 `shiftR` 1
11
```

ビット演算は、特化されたコードや特定のハイパフォーマンスなアプリケーションでよく使用されます。プログラマとして、それらが存在しどのように動作するかを知っておくことは重要です。

## 整数リテラル (Integer Literals)

これまでは、特定の型に対して整数リテラルを使用できるようにするために常に `Num` の実装が必要でした。しかし実際には、`Integer` を対象の型に変換する `fromInteger` 関数を実装するだけで十分です。最後の節で見るように、このような関数は有効なリテラルとして許可される値を制約することさえ可能です。

例えば、化学分子の電荷を表すデータ型を定義したいとしましょう。電荷の値は正または負になり、（理論上）任意の大きさを取ることができます：

```idris
record Charge where
  constructor MkCharge
  value : Integer
```

電荷どうしを加算できるのは自然ですが、乗算することは意味をなしません。したがって、`Monoid` の実装は持つべきですが、`Num` の実装は持つべきではありません。それでも、コンパイル時に定数の電荷を使用する際には整数リテラルの利便性を享受したいと考えます。これを行う方法は以下のとおりです：

```idris
fromInteger : Integer -> Charge
fromInteger = MkCharge

Semigroup Charge where
  x <+> y = MkCharge $ x.value + y.value

Monoid Charge where
  neutral = 0
```

### 基数の指定 (Alternative Bases)

おなじみの 10 進数リテラルに加えて、2 進数、8 進数、16 進数表現で整数リテラルを記述することも可能です。これらは、先頭に 0 を置き、その後にそれぞれ 2 進数は `b`、8 進数は `o`、16 進数は `x` を付加します：

```repl
Tutorial.Prim> 0b1101
13
Tutorial.Prim> 0o773
507
Tutorial.Prim> 0xffa2
65442
```

<!-- vi: filetype=idris2:syntax=markdown
-->
