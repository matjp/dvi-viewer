# DVI Viewer

An example React app showing how to decode and render `LuaTeX` `dvi` files using [dvi-decode](https://github.com/matjp/dvi-decode).

## Instructions

Either download the source and build the app yourself, or try it on Github Pages: <https://matjp.github.io/dvi-viewer/> (this build works only with Latin Modern fonts).

In your `LaTeX` source set the fonts after all packages have been loaded. i.e.

```latex
\usepackage{unicode-math}

\setmainfont{lmroman10}[
    Extension = .otf ,
    UprightFont = *-regular ,
    BoldFont = *-bold ,
    ItalicFont = *-italic ,
    BoldItalicFont = *-bolditalic ,
    SmallCapsFont = lmromancaps10-regular ,
    Renderer = OpenType ]

\setmonofont{lmmono10}[
    Extension = .otf ,
    UprightFont = *-regular ,
    ItalicFont = *-italic ,
    Renderer = OpenType ]

\setmathfont{latinmodern-math.otf}[
    Renderer = OpenType ]
```

Generate your `dvi` file using the `dvilualatex` command, then upload it to the app.

If you get errors, check that your `LaTeX` source meets the following conditions:

## LaTeX source assumptions

In order for `dvi-decode` to interpret a `LuaTeX` `dvi` file correctly it makes some assumptions about the font settings in the `LaTeX` source file:

1. The fonts used are OpenType or TrueType.
2. The `unicode-math` package is used if math symbols are used.
3. Every font used is explicitly set using a `fontspec` command.
4. Fonts are set using filenames rather than proper names i.e.

    ```latex
    \setmathfont{latinmodern-math.otf}[Renderer=OpenType]
    ```

5. The font option `Renderer=Opentype` has been selected for every font used. This ensures the expected character encodings are produced in the `dvi` file.
