# ユースケース: 核酸 (Use Case: Nucleic Acids)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/DPair/DNA.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/DPair/DNA.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.DPair.DNA

import Data.DPair
import Data.Either
import Data.HList
import Data.List
import Data.List1
import Data.Singleton
import Data.String
import Data.Vect

import Text.CSV

%default total
```

核酸（RNA と DNA）を扱う簡単なライブラリを考えてみましょう。核酸は 5 種類の塩基から構成され、そのうち 3 種類（A, C, G）は両方に共通で、残り 2 種類（T, U）はそれぞれ固有です。不正な塩基が鎖に混入しないように型で保証します：

```idris
data BaseType = DNABase | RNABase

data Nucleobase : BaseType -> Type where
  Adenine  : Nucleobase b
  Cytosine : Nucleobase b
  Guanine  : Nucleobase b
  Thymine  : Nucleobase DNABase
  Uracile  : Nucleobase RNABase

NucleicAcid : BaseType -> Type
NucleicAcid = List . Nucleobase

RNA : Type
RNA = NucleicAcid RNABase

DNA : Type
DNA = NucleicAcid DNABase

encodeBase : Nucleobase b -> Char
encodeBase Adenine  = 'A'
encodeBase Cytosine = 'C'
encodeBase Guanine  = 'G'
encodeBase Thymine  = 'T'
encodeBase Uracile  = 'U'

encode : NucleicAcid b -> String
encode = pack . map encodeBase
```

DNA 鎖の中に `Uracile`（ウラシル）を含めようとすると、コンパイル時エラーになります：

```idris
failing "Mismatch between: RNABase and DNABase."
  errDNA : DNA
  errDNA = [Uracile, Adenine]
```

DNA / RNA 鎖のパーサーを記述します：

```idris
readAnyBase : Char -> Maybe (Nucleobase b)
readAnyBase 'A' = Just Adenine
readAnyBase 'C' = Just Cytosine
readAnyBase 'G' = Just Guanine
readAnyBase _   = Nothing

readRNABase : Char -> Maybe (Nucleobase RNABase)
readRNABase 'U' = Just Uracile
readRNABase c   = readAnyBase c

readDNABase : Char -> Maybe (Nucleobase DNABase)
readDNABase 'T' = Just Thymine
readDNABase c   = readAnyBase c

readRNA : String -> Maybe RNA
readRNA = traverse readRNABase . unpack

readDNA : String -> Maybe DNA
readDNA = traverse readDNABase . unpack
```

相補鎖（complementary strand）を計算する関数を定義する際、塩基型 `BaseType` を引数として受け取ることで、コードの重複を防ぎつつ依存関数型（**$\Pi$ 型 / Pi type**）として実装できます：

```idris
complementBase : (b : BaseType) -> Nucleobase b -> Nucleobase b
complementBase DNABase Adenine  = Thymine
complementBase RNABase Adenine  = Uracile
complementBase _       Cytosine = Guanine
complementBase _       Guanine  = Cytosine
complementBase _       Thymine  = Adenine
complementBase _       Uracile  = Adenine

complement : (b : BaseType) -> NucleicAcid b -> NucleicAcid b
complement b = map (complementBase b)
```

ユーザー入力から核酸配列を読み込む場合、ユーザーが入力するまで DNA か RNA かはわかりません。これを依存ペア `(b ** NucleicAcid b)` として表現します：

```idris
namespace InputError
  public export
  data InputError : Type where
    UnknownBaseType : String -> InputError
    InvalidSequence : String -> InputError

readAcid : (b : BaseType) -> String -> Either InputError (NucleicAcid b)
readAcid b str =
  let err = InvalidSequence str
   in case b of
        DNABase => maybeToEither err $ readDNA str
        RNABase => maybeToEither err $ readRNA str

getNucleicAcid : IO (Either InputError (b ** NucleicAcid b))
getNucleicAcid = do
  baseString <- getLine
  case baseString of
    "DNA" => map (MkDPair _) . readAcid DNABase <$> getLine
    "RNA" => map (MkDPair _) . readAcid RNABase <$> getLine
    _     => pure $ Left (UnknownBaseType baseString)
```

依存ペアの第 1 要素 `b` に対してパターンマッチを行うことで、第 2 要素が DNA か RNA かを型安全に判定し、転写（transcribe）などの適切な処理を分岐できます：

```idris
transcribeBase : Nucleobase DNABase -> Nucleobase RNABase
transcribeBase Adenine  = Uracile
transcribeBase Cytosine = Guanine
transcribeBase Guanine  = Cytosine
transcribeBase Thymine  = Adenine

transcribe : DNA -> RNA
transcribe = map transcribeBase

printRNA : RNA -> IO ()
printRNA = putStrLn . encode

transcribeProg : IO ()
transcribeProg = do
  Right (b ** seq) <- getNucleicAcid
    | Left (InvalidSequence str) => putStrLn $ "Invalid sequence: " ++ str
    | Left (UnknownBaseType str) => putStrLn $ "Unknown base type: " ++ str
  case b of
    DNABase => printRNA $ transcribe seq
    RNABase => printRNA seq
```

## 依存レコード vs 直和型 (Dependent Records vs Sum Types)

依存ペア、カスタム依存レコード、直和型は、単純なケースでは同様の表現力を持ちます：

```idris
Acid1 : Type
Acid1 = (b ** NucleicAcid b)

record Acid2 where
  constructor MkAcid2
  baseType : BaseType
  sequence : NucleicAcid baseType

data Acid3 : Type where
  SomeRNA : RNA -> Acid3
  SomeDNA : DNA -> Acid3
```

依存先が複数の値にまたがる複雑なケースでは、直和型よりも依存レコード（または依存ペア）を用いた表現がはるかに扱いやすくなります。

<!-- vi: filetype=idris2:syntax=markdown
-->
