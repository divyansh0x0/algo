# YASL (Yet another scripting langugae)

## Grammar (format is PEG)

```peg
Program                         <- StatementList
StatementList                   <- (Statement EOL?)*
EOL                             <- ";" | [\n\r]+
Statement <- DeclarationStmt
           / FunctionDeclarationStmt
           / ClassDeclarationStmt
           / IterationStmt
           / AssignmentStmt
           / IfStmt
           / ExpressionStmt

FunctionDeclarationStmt         <- "fn" Identifier "(" ParameterList? ")" (":" Type)? "{" StatementList "}"
ParameterList                   <- Paramater ("," Parameter)*
Parameter                       <- Identifier (":" Type)?
DeclarationStmt                 <- "let" Identifier (":" Type)? "=" Assignable
AssignmentStmt                  <- Identifier (":" Type)? "=" Assignable
Type                            <- Identifier
Assignable                      <- Expression

Identifier                      <- [a-zA-Z_][a-zA-Z0-9_]*
LValue                          <- PropertyAccess | Identifier
PropertyAccess                  <- Identifier "." Identifier ("." Identifier)*

ExpressionStmt                  <- Expression
Expression                      <- IfExp / SwitchExp / BooleanOr
BooleanOr                       <- BooleanAnd ("or" BooleanAnd)*
BooleanAnd                      <- Equality ("and" Equality)*
Equality                        <- Relational (("==" | "!=") Relational)*
Relational                      <- Additive (("<" | "<=" | ">" | ">=") Additive)*
Additive                        <- Shift (("+" | "-") Shift)*
Shift                           <- Bitwise (("<<" | ">>" | "<<<") Bitwise)*
Bitwise                         <- Term (("&" | "|" | "^" | "~") Term)*
Term                            <- Factor (("*" | "/" | "%") Factor)*
Factor                          <- Prefix ("**" Factor)?
Prefix                          <- ("-" | "~" | "!")* Postfix
Postfix <- Primary (
      "(" ArgumentList? ")"
    | "." Identifier
    | "++"
    | "--"
)*
Primary                         <- Call / AssignableExp  / NumberLiteral / LValue / "(" Expression ")" / StringLiteral


Call                            <- FunctionCall | ObjectCreationCall
FunctionCall                    <- LValue "(" ArgumentList? ")"
ObjectCreationCall              <- "new" LValue "(" ArgumentList? ")"
ArgumentList                    <- Expression ("," Expression)*


AssignableExp                   <- "(" LValue (":" Type)? ":=" Expression ")"
DeclarationExp                  <- "(" DeclarationStmt ")"

IfExp <- "if" "(" Expression ")" ExprBody
          "else" (IfExp / ExprBody)

IfStmt <- "if" "(" Expression ")" StatementBody
           ("else" (IfStmt / StatementBody))?

SwitchExp                       <- "switch" "(" Expression ")" "{" CaseStmt* DefaultStmt? "}"
CaseStmt                       <- Expression ":" ExprBody EOL
DefaultStmt                       <- "_" ":" ExprBody EOL


ExprBody <- BlockExp / Expression
StatementBody <- BlockExp / Statement

IterationStmt                  <- ("while" "(" Expression ")" ExprBody ) |
                                   ("for" "(" DeclarationStmt | AssignmentStmt ";" Expression? ";" Expression? ")" ExprBody)

BlockExp                       <- "{" (Statement EOL?)* ExpressionStmt? "}"

ClassDeclarationStmt            <- "class" Identifier "{" ClassStatement*  "}" ("implements" Identifier)?
ClassStatement                  <-  FieldDeclarationStmt | ConstructorStmt  | MethodDeclarationStmt
FieldDeclarationStmt            <- fieldModifier? DeclarationStmt ";"
ConstructorStmt                 <- visibilityModifier? "(" ParameterList? ")" "{" StatementList "}"
MethodDeclarationStmt           <- visibilityModifier? FunctionDeclarationStmt
visibilityModifier              <- "self" | "pub" | "static"
fieldModifier                   <- "readonly"


NumberLiteral       <- [0-9]+(.[0-9]+)?
StringLiteral       <- ("\"" [^"]* "\"") | ("'" [^']* "'")
```

### Expressions:

- For assignment in expression the assignment must be wrapped in parentheses. Meaning
  `while (x = getInput()) return true` is invalid and should be `if( (x = getInput()) ) return true`.
  This is to make assignment expressions explicit.
-

## Operator Precedence

```text
( )
++ --
and
or
!
**
<< >> ^ ~ & |
| * %
+ -
?:
```

in case of similar precedence, the expression is parsed left to right

## Implementation Status of Evaluator

### Core Constructs
- [x] Variables & Declarations (`let`)
- [x] Assignments (`x = 1`, `(x := 1)`)
- [x] Block Scoping (`{ ... }`)
- [x] Expression Statements

### Control Flow
- [ ] If / Else If / Else
- [ ] Switch / Case
- [ ] While Loops
- [ ] For Loops
- [ ] Break / Continue
- [ ] Return

### Expressions & Operators
- [x] Literals (Numbers, Strings, Booleans, Null)
- [x] Identifiers
- [x] Binary Operators (Arithmetic, Relational, Logical, Bitwise)
- [ ] Unary Operators (Prefix `!`, `-`, `~`)
- [ ] Postfix Operators (`++`, `--`)
- [ ] Ternary Operator (`?:`)

### Data Structures
- [x] Arrays (`[]`)
- [ ] Array Indexing (`arr[i]`)
- [ ] Property Access (`obj.prop`)

### Functions & Methods
- [ ] Function Declarations (`fn`)
- [x] Function Calls (`foo()`)
- [x] Native Array Methods (e.g., `print`)

### Object-Oriented Programming
- [ ] Classes (`class`, `implements`)
- [ ] Constructors
- [ ] Methods & Fields
- [ ] Object Instantiation (`new`)
- [ ] Access Modifiers (`self`, `pub`, `static`, `readonly`)

### Types
- [ ] Static Type Annotations (`: Type`)
- [ ] Type Checking Pipeline

## Implementation status of Parser

### Core Constructs
- [x] Variables & Declarations (`let`)
- [x] Assignments (`x = 1`, `(x := 1)`)
- [x] Block Scoping (`{ ... }`)
- [x] Expression Statements

### Control Flow
- [ ] If / Else If / Else
- [ ] Switch / Case
- [ ] While Loops
- [ ] For Loops
- [ ] Break / Continue
- [ ] Return

### Expressions & Operators
- [x] Literals (Numbers, Strings, Booleans)
- [x] Identifiers
- [x] Binary Operators (Arithmetic, Relational, Logical, Bitwise)
- [x] Unary Operators (Prefix `!`, `-`)
- [x] Postfix Operators (`++`, `--`)
- [ ] Ternary Operator (`?:`)

### Data Structures
- [x] Arrays (`[]`)
- [x] Array Indexing (`arr[i]`)
- [x] Property Access (`obj.prop`)

### Functions & Methods
- [ ] Function Declarations (`fn`)
- [x] Function Calls (`foo()`)

### Object-Oriented Programming
- [ ] Classes (`class`, `implements`)
- [ ] Constructors
- [ ] Methods & Fields
- [ ] Object Instantiation (`new`)
- [ ] Access Modifiers (`self`, `pub`, `static`, `readonly`)

### Types
- [x] Static Type Annotations (`: Type`)
- [x] Union Types (`Type | Type`)