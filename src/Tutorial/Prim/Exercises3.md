# プリミティブ 練習問題 パート3

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Prim/Exercises3.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Prim/Exercises3.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

この非常に充実した練習問題セットでは、プリミティブに対する述語を扱うための小さなライブラリを構築します。以下の目標を念頭に置いて進めてください：

- 命題論理の通常の演算を用いて述語を組み合わせられるようにする: 否定（negation）、論理積（conjunction / *AND*）、論理和（disjunction / *OR*）。
- すべての述語は実行時に消去される（erased）ようにする。プリミティブな数値について何かを証明する場合、実行時に巨大な妥当性の証明を持ち歩かないようにする。
- 述語に対する計算は実行時に現れないようにする（`decide` の実装を除く。後述）。
- `decide` の実装で使用される述語に対する再帰計算は、可能であれば末尾再帰にする。これは達成が難しい場合もあります。特定の問題に対して末尾再帰の解法が見つからない場合は、最も自然に思える方法を採用してください。

効率に関する補足: 述語に対する計算を実行できるようにするため、プリミティブ値を可能な限り頻繁かつ早期に代数的データ型に変換します。符号なし整数は `cast` を使って `Nat` に変換し、文字列は `unpack` を使って `List Char` に変換します。これにより、ほとんどの場合で `Nat` や `List` に対する証明を扱うことができ、そのような証明は `believe_me` やその他の裏技に頼ることなく実装できます。

しかし、代数的データ型に対するプリミティブ型の唯一の利点は、多くの場合ではるかに優れたパフォーマンスを発揮することです。これは特に整数型と `Nat` を比較する場合に顕著です。自然数に対する演算は関数の引数の自然数の大きさを $n$ としたとき $O(n)$ の時間計算量で実行されることが多いのに対し、例えば `Bits64` の多くの演算は高速な定数時間（$O(1)$）で実行されます。幸いなことに、Idris コンパイラは自然数に対する多くの関数を実行時に対応する `Integer` 演算を使用するように最適化します。これには、コンパイル時には自然数について完全な数学的帰納法を用いて証明を行いつつ、実行時には高速な整数演算の恩恵を享受できるという利点があります。

ただし、`Nat` に対する演算は *コンパイル時* には $O(n)$ の時間計算量で実行されます。したがって、大きな自然数に対する証明はコンパイラを大幅に低速化させる要因になります。この回避策については本練習問題の最後で議論します。

前置きはここまでにして、始めましょう！まず、以下のユーティリティが与えられています：

```idris
-- `Dec` に似ていますが、証明が消去されます。
-- コンストラクタ `Yes0` と `No0` はコンパイラによって
-- 定数 `0` と `1` に変換されます！
data Dec0 : (prop : Type) -> Type where
  Yes0 : (0 prf : prop) -> Dec0 prop
  No0  : (0 contra : prop -> Void) -> Dec0 prop

-- 複数のパラメータを持つインターフェース（この例では `a` と `p`）では、
-- 一方のパラメータが分かればもう一方が確定することがあります。
-- 例えば `p` が分かれば、ほぼ確実に `a` も分かります。
-- したがって、縦棒の後に `p` を指定して `| p` と書くことで、
-- `Decidable` の証明探索が `p` のみに基づいて行われるように指定します。
-- これは、述語の章で示したデータ型の探索パラメータを `[search p]` で
-- 指定するのと同様です。
-- ここで示すように単一の探索パラメータを指定することは、
-- 型推論を大幅に支援します。
interface Decidable (0 a : Type) (0 p : a -> Type) | p where
  decide : (v : a) -> Dec0 (p v)

-- Idris の型推論を助けるために `p` を明示的に渡す必要があることがよくあります。
-- そのような場合、`decide {p = pred}` の代わりに `decideOn pred` を
-- 使用する方が便利です。
decideOn : (0 p : a -> Type) -> Decidable a p => (v : a) -> Dec0 (p v)
decideOn _ = decide

-- 一部のプリミティブな述語はブール関数を用いてのみ合理的に実装できます。
-- このユーティリティはそのような証明に対する決定可能性を支援します。
test0 : (b : Bool) -> Dec0 (b === True)
test0 True  = Yes0 Refl
test0 False = No0 absurd
```

また、コンパイル時に決定可能な計算を実行したいと考えます。これは帰納的型に対して直接証明探索を行うよりもはるかに効率的なことが多いためです。そこで、`Dec0` の値が実際に `Yes0` であることを証拠立てる述語と、2 つのユーティリティ関数を用意します：

```idris
data IsYes0 : (d : Dec0 prop) -> Type where
  ItIsYes0 : {0 prf : _} -> IsYes0 (Yes0 prf)

0 fromYes0 : (d : Dec0 prop) -> (0 prf : IsYes0 d) => prop
fromYes0 (Yes0 x) = x
fromYes0 (No0 contra) impossible

0 safeDecideOn :  (0 p : a -> Type)
               -> Decidable a p
               => (v : a)
               -> (0 prf : IsYes0 (decideOn p v))
               => p v
safeDecideOn p v = fromYes0 $ decideOn p v
```

最後に、主にプリミティブを洗練することを計画しているため、自分が何をしているかを Idris に納得させるための強力な手段が時折必要になります：

```idris
-- `decideOn p v` が確実に `Yes0` を返すと確信できる場合にのみ
-- 使用してください！
0 unsafeDecideOn : (0 p : a -> Type) -> Decidable a p => (v : a) -> p v
unsafeDecideOn p v = case decideOn p v of
  Yes0 prf => prf
  No0  _   =>
    assert_total $ idris_crash "Unexpected refinement failure in `unsafeRefineOn`"
```

01. 等値性の証明から始めます。`Equal v` に対する `Decidable` を実装してください。

    ヒント: `Decidable.Equality` モジュールの `DecEq` を制約として使用し、`v` が実行時に利用可能であることを確認してください。

02. 述語を否定できるようにしたいと考えます：

    ```idris
    data Neg : (p : a -> Type) -> a -> Type where
      IsNot : {0 p : a -> Type} -> (contra : p v -> Void) -> Neg p v
    ```

    適切な制約を用いて、`Neg p` に対する `Decidable` を実装してください。

03. 2 つの述語の論理積（AND）を記述したいと考えます：

    ```idris
    data (&&) : (p,q : a -> Type) -> a -> Type where
      Both : {0 p,q : a -> Type} -> (prf1 : p v) -> (prf2 : q v) -> (&&) p q v
    ```

    適切な制約を用いて、`(p && q)` に対する `Decidable` を実装してください。

04. 2 つの述語の論理和（OR）を表すデータ型 `(||)` を考案し、適切な制約を用いて `Decidable` を実装してください。

05. 以下の命題を実装することで、[ド・モルガンの法則（De Morgan's laws）](https://ja.wikipedia.org/wiki/%E3%83%89%E3%83%BB%E3%83%A2%E3%83%AB%E3%82%AC%E3%83%B3%E3%81%AE%E6%B3%95%E5%89%87) を証明してください：

    ```idris
    negOr : Neg (p || q) v -> (Neg p && Neg q) v

    andNeg : (Neg p && Neg q) v -> Neg (p || q) v

    orNeg : (Neg p || Neg q) v -> Neg (p && q) v
    ```

    ド・モルガンの含意のうち最後のものは、`p v` と `q v` の型の値を用意し、両方が同時に存在しえないことを示す必要があるため、型付けと証明が難しくなります。これをエンコードする方法は以下のとおりです（消去された対偶にアクセスする必要があるため、多重度 0 の注釈が付いています）：

    ```idris
    0 negAnd :  Decidable a p
             => Decidable a q
             => Neg (p && q) v
             -> (Neg p || Neg q) v
    ```

    `negAnd` を実装する際、`negAnd` 自体が消去されたコンテキストでのみ使用できるため、消去された（暗黙の）引数に自由にアクセスできることを思い出してください。

    ここまでで、複数の述語を代数的に記述・合成するためのツールを実装しました。ここからは具体例を見ていきましょう。最初のユースケースとして、自然数の有効範囲を制限することに焦点を当てます。このために以下のデータ型を使用します：

    ```idris
    -- m <= n の証明
    data (<=) : (m,n : Nat) -> Type where
      ZLTE : 0 <= n
      SLTE : m <= n -> S m <= S n
    ```

    これは `Data.Nat.LTE` に似ていますが、演算子表記の方がわかりやすいことが多いです。また、以下のエイリアスを定義して使用できます：

    ```repl
    (>=) : (m,n : Nat) -> Type
    m >= n = n <= m

    (<) : (m,n : Nat) -> Type
    m < n = S m <= n

    (>) : (m,n : Nat) -> Type
    m > n = n < m

    LessThan : (m,n : Nat) -> Type
    LessThan m = (< m)

    To : (m,n : Nat) -> Type
    To m = (<= m)

    GreaterThan : (m,n : Nat) -> Type
    GreaterThan m = (> m)

    From : (m,n : Nat) -> Type
    From m = (>= m)

    FromTo : (lower,upper : Nat) -> Nat -> Type
    FromTo l u = From l && To u

    Between : (lower,upper : Nat) -> Nat -> Type
    Between l u = GreaterThan l && LessThan u
    ```

06. `m` と `n` に対するパターンマッチによって `m <= n` 型の値を生成することは、`m` が大きい値の場合に $m$ 回の反復が必要となるため非常に非効率的です。しかし、消去されたコンテキストにおいては、`m <= n` 型の値を保持する必要はありません。そのような値がより効率的な計算から導かれることだけを示せば十分です。そのような計算が自然数に対する `compare` です。これは *Prelude* では引数に対するパターンマッチで実装されていますが、コンパイラによって非常に大きな数値に対しても定数時間で実行される整数比較に最適化されます。自然数に対する `Prelude.(<=)` は `compare` を用いて実装されているため、同様に効率的に動作します。

    したがって、以下の 2 つの補題を証明する必要があります（宣言内で `Prelude.(<=)` と `Prim.(<=)` を混同しないように注意してください）：

    ```idris
    0 fromLTE : (n1,n2 : Nat) -> (n1 <= n2) === True -> n1 <= n2

    0 toLTE : (n1,n2 : Nat) -> n1 <= n2 -> (n1 <= n2) === True
    ```

    これらは先ほど説明した他の計算と同様に非効率であるため、多重度 0 が指定されています。これにより、実行時には決して使用されないことが完全に保証されます！

    それでは、`test0`、`fromLTE`、`toLTE` を活用して `Decidable Nat (<= n)` を実装してください。同様に、両方の種類の述語が必要となるため、`Decidable Nat (m <=)` も実装してください。

    注意: `n` が実行時に利用可能でなければならないこと、およびそれを確実にする方法については、そろそろ理解できているはずです。

07. 対応する命題を宣言・実装することで、`(<=)` が反射的（reflexive）かつ推移的（transitive）であることを証明してください。推移性の証明を使って `(<=)` 型の複数の値を連鎖させる必要があるかもしれないため、これに対する短い演算子エイリアスを定義するのも有益です。

08. `n > 0` から `IsSucc n` が導かれ、その逆も成り立つことを証明してください。

09. 自然数にキャストしたときに分母が狭義に正（0 より大きい）であるという消去された証明を要求することで、`Bits64` に対する安全な除算および剰余関数を宣言・実装してください。剰余関数の場合、結果が法（modulus）より真に小さいという消去された証明を保持する洗練された値を返してください：

    ```idris
    safeMod :  (x,y : Bits64)
            -> (0 prf : cast y > 0)
            => Subset Bits64 (\v => cast v < cast y)
    ```

10. ここまでに定義した述語とユーティリティを使用して、`2 <= b && b <= 16` を満たす基数 `b` の数字列（文字列）に `Bits64` 型の値を変換します。そのために、以下のスケルトン定義を実装してください：

    ```idris
    -- これには `assert_total` と `idris_crash` の助けが必要です
    digit : (v : Bits64) -> (0 prf : cast v < 16) => Char

    record Base where
      constructor MkBase
      value : Bits64
      0 prf : FromTo 2 16 (cast value)

    base : Bits64 -> Maybe Base

    namespace Base
      public export
      fromInteger : (v : Integer) -> {auto 0 _ : IsJust (base $ cast v)} -> Base
    ```

    最後に、実装内で `safeDiv` と `safeMod` を使用して `digits` を実装してください。型チェッカーを満たすために一部の証明を手動で変換する必要があるため、これは挑戦的な課題かもしれません。再帰ステップで `assert_smaller` が必要になる場合もあります。

    ```idris
    digits : Bits64 -> Base -> String
    ```

    次に、文字列に対する述語に焦点を当てます。受け入れる文字列を制限する最も明白な方法の 2 つは、文字の集合を制限することと、長さを制限することです。より高度な洗練では、文字列が特定のパターンや正規表現に一致することを要求する場合があります。そのような場合、ブール値チェックを行うか、パターンの異なる部分を表すカスタムデータ型を使用しますが、ここではそれらのトピックは扱いません。

11. 文字に対する有用な述語の以下のエイリアスを実装してください。

    ヒント: 文字を自然数に変換するには `cast` を使い、文字の範囲を指定するには `(<=)` と `InRange` を使い、文字の範囲を合成するには `(||)` を使用してください。

    ```idris
    -- 127 以下の文字
    IsAscii : Char -> Type

    -- 255 以下の文字
    IsLatin : Char -> Type

    -- 区間 ['A','Z'] の文字
    IsUpper : Char -> Type

    -- 区間 ['a','z'] の文字
    IsLower : Char -> Type

    -- 英大文字または英小文字
    IsAlpha : Char -> Type

    -- 範囲 ['0','9'] の数字文字
    IsDigit : Char -> Type

    -- 数字文字または英文字
    IsAlphaNum : Char -> Type

    -- 範囲 [0,31] または [127,159] の文字
    IsControl : Char -> Type

    -- 制御文字ではない ASCII 文字
    IsPlainAscii : Char -> Type

    -- 制御文字ではない Latin 文字
    IsPlainLatin : Char -> Type
    ```

12. プリミティブに対する述語へのこのよりモジュール化されたアプローチの利点は、述語に対して安全に計算を実行でき、`Nat` や `List` のような帰納的型に対する既存の証明から強力な保証を得られる点です。以下は、裏技を使うことなくすべて実装できるそのような計算と変換の例です：

    ```idris
    0 plainToAscii : IsPlainAscii c -> IsAscii c

    0 digitToAlphaNum : IsDigit c -> IsAlphaNum c

    0 alphaToAlphaNum : IsAlpha c -> IsAlphaNum c

    0 lowerToAlpha : IsLower c -> IsAlpha c

    0 upperToAlpha : IsUpper c -> IsAlpha c

    0 lowerToAlphaNum : IsLower c -> IsAlphaNum c

    0 upperToAlphaNum : IsUpper c -> IsAlphaNum c
    ```

    次の `asciiToLatin` は少しトリッキーです。`(<=)` が推移的であることを思い出してください。ただし、推移性の証明の呼び出しにおいて、探索深度が小さすぎるため `%search` を用いた直接の証明探索を適用することはできません。探索深度を増やすこともできますが、代わりに `safeDecideOn` を使用する方がはるかに効率的です。

    ```idris
    0 asciiToLatin : IsAscii c -> IsLatin c

    0 plainAsciiToPlainLatin : IsPlainAscii c -> IsPlainLatin c
    ```

    文字列に対する述語に本格的に取り掛かる前に、文字列を文字のリストとして扱うことが多いため、まずリストについて扱う必要があります。

13. `Head` に対する `Decidable` を実装してください：

    ```idris
    data Head : (p : a -> Type) -> List a -> Type where
      AtHead : {0 p : a -> Type} -> (0 prf : p v) -> Head p (v :: vs)
    ```

14. `Length` に対する `Decidable` を実装してください：

    ```idris
    data Length : (p : Nat -> Type) -> List a -> Type where
      HasLength :  {0 p : Nat -> Type}
                -> (0 prf : p (List.length vs))
                -> Length p vs
    ```

15. 以下の述語は、値のリスト内のすべての値が指定された述語を満たすことの証明です。これを使って、文字列内の有効な文字集合を制限します。

    ```idris
    data All : (p : a -> Type) -> (as : List a) -> Type where
      Nil  : All p []
      (::) :  {0 p : a -> Type}
           -> (0 h : p v)
           -> (0 t : All p vs)
           -> All p (v :: vs)
    ```

    `All` に対する `Decidable` を実装してください。

    本格的な挑戦として、`decide` の実装を末尾再帰にしてみてください。これは JavaScript バックエンドでの実際のアプリケーションにおいて、実行時にスタックをオーバーフローさせることなく何千文字もの文字列を洗練したい場合に重要になります。末尾再帰の実装を作成するには、述語が `SnocList` のすべての要素に対して成り立つことを証拠立てる追加のデータ型 `AllSnoc` が必要になります。

16. いよいよ締めくくりです。Idris における識別子（identifier）は、英数字のシーケンスであり、アンダースコア（`_`）で区切られている場合もあります。さらに、すべての識別子は英文字で始まらなければなりません。この仕様に基づいて、識別子のための新しいラッパー型を定義できる述語 `IdentChar` を実装してください：

    ```idris
    0 IdentChars : List Char -> Type

    record Identifier where
      constructor MkIdentifier
      value : String
      0 prf : IdentChars (unpack value)
    ```

    実行時に未知のソースの文字列を変換するためのファクトリ関数 `identifier` を実装してください：

    ```idris
    identifier : String -> Maybe Identifier
    ```

    さらに、`Identifier` に対する `fromString` を実装し、以下が有効な識別子であることを検証してください：

    ```idris
    testIdent : Identifier
    testIdent = "fooBar_123"
    ```

結びの言葉: プリミティブについて何かを証明することは、どのような公理を使用するかを決める際にも、実行時やコンパイル時に適切に動作させようとする際にも、困難を伴う場合があります。筆者はこれらの問題に対処するライブラリを実験的に作成しています。まだ完成していませんが、[こちら](https://github.com/stefan-hoeck/idris2-prim) で確認できます。

