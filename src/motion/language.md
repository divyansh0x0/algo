# YASL (Yet another scripting langugae)

## Grammar (format is PEG)

```peg
Program                         <- StatementList
StatementList                   <- (Statement EOL?)*
EOL                             <- ";" | [\n\r]+
Statement                       <- FunctionDeclarationStmt | ConditionStmt | IterationStmt | ClassDeclarationStmt | DeclarationStmt | ExpressionStmt | BlockStmt
ExpressionStmt                  <- Expression

FunctionDeclarationStmt         <- "fn" SimpleIdentifier "(" ParameterList? ")" (":" Type)? BlockStmt
ParameterList                   <- Paramater ("," Parameter)*
Parameter                       <- SimpleIdentifier (":" Type)?
DeclarationStmt                 <- "let" Identifier (":" Type)? "=" Assignable
AssignmentStmt                  <- Identifier (":" Type)? "=" Assignable
Type                            <- SimpleIdentifier
Assignable                      <- Call | Expression
Call                            <- FunctionCall | ObjectCreationCall
FunctionCall                    <- SimpleIdentifier "(" ArgumentList? ")"
ObjectCreationCall              <- "new" SimpleIdentifier "(" ArgumentList? ")"
ArgumentList                    <- SimpleIdentifier ("," SimpleIdentifier)*

SimpleIdentifier                <- [a-zA-Z_][a-zA-Z0-9_]*
Identifier                      <- PropertyAccess | SimpleIdentifier
PropertyAccess                  <- SimpleIdentifier "." SimpleIdentifier ("." SimpleIdentifier)*

Expression                      <- InlineCondition
InlineCondition                 <- BooleanOr ("?" Expression ":" Expression)?
BooleanOr                       <- BooleanAnd ("or" BooleanAnd)*
BooleanAnd                      <- Equality ("and" Equality)*
Equality                        <- Relational (("==" | "!=") Relational)*
Relational                      <- Additive (("<" | "<=" | ">" | ">=") Additive)*
Additive                        <- Shift (("+" | "-") Shift)*
Shift                           <- Bitwise (("<<" | ">>" | "<<<") Bitwise)*
Bitwise                         <- Term (("&" | "|" | "^" | "~") Term)*
Term                            <- Factor (("*" | "/" | "%") Factor)*
Factor                          <- Prefix ("**" Prefix)*
Prefix                          <- ("-" | "~" | "!")? Postfix
Postfix                         <- Primary ("++" | "--")?
Primary                         <- Number | Identifier | "(" Expression ")" | AssignableExp | Call | InlineCondition

AssignableExp                   <- "(" AssignmentStmt ")"
DeclarationExp                  <- "(" DeclarationStmt ")"

ConditionStmt                   <- "if" "(" Expression ")" Statement
                                    ("else" "if" "(" Expression ")" Statement)*
                                    ("else" Statement)?

IterationStmt                   <- ("while" "(" Expression ")" Statement ) |
                                   ("for" "(" Expression ";" Expression ";" Expression ")" Statement)

BlockStmt                       <- "{" StatementList? "}"

ClassDeclarationStmt            <- "class" SimpleIdentifier "{" ClassStatement*  "}" ("implements" SimpleIdentifier)?
ClassStatement                  <-  FieldDeclarationStmt | ConstructorStmt  | MethodDeclarationStmt
FieldDeclarationStmt            <- fieldModifier? DeclarationStmt ";"
ConstructorStmt                 <- visibilityModifier? "(" ParameterList? ")" BlockStmt
MethodDeclarationStmt           <- visibilityModifier? FunctionDeclarationStmt
visibilityModifier              <- "self" | "pub" | "static"
fieldModifier                   <- "readonly"


NumberLiteral       <- [0-9]+(.[0-9]+)?
StringLiteral       <- ("\"" [^"]* "\"") | ("'" [^']* "'")
```

### Expressions:

- For assignment in expression the assignment must be wrapped in parenthesis. Meaning
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
