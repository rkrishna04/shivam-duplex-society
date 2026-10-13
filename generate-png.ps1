Add-Type -AssemblyName System.Drawing

$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)
$outDir = "C:\Users\Krishna\.gemini\antigravity\scratch\shivam-duplex-society\icons"

if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

foreach ($sz in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($sz, $sz)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Background gradient
    $rect = New-Object System.Drawing.Rectangle(0, 0, $sz, $sz)
    $c1 = [System.Drawing.Color]::FromArgb(255, 10, 8, 32)
    $c2 = [System.Drawing.Color]::FromArgb(255, 26, 16, 80)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 45.0)
    $g.FillRectangle($brush, $rect)
    $brush.Dispose()

    # Inner Glow ellipse
    $glowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(70, 79, 70, 229))
    $g.FillEllipse($glowBrush, [int]($sz * 0.15), [int]($sz * 0.1), [int]($sz * 0.7), [int]($sz * 0.7))
    $glowBrush.Dispose()

    # Rounded border outline
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(60, 255, 255, 255), [float]([Math]::Max(1.0, $sz * 0.02)))
    $g.DrawRectangle($borderPen, [int]($sz * 0.04), [int]($sz * 0.04), [int]($sz * 0.92), [int]($sz * 0.92))
    $borderPen.Dispose()

    # Roof (triangle)
    $p1 = New-Object System.Drawing.Point([int]($sz * 0.50), [int]($sz * 0.18))
    $p2 = New-Object System.Drawing.Point([int]($sz * 0.16), [int]($sz * 0.44))
    $p3 = New-Object System.Drawing.Point([int]($sz * 0.84), [int]($sz * 0.44))
    $roofBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(255, 249, 115, 22),
        [System.Drawing.Color]::FromArgb(255, 236, 72, 153),
        45.0
    )
    $g.FillPolygon($roofBrush, @($p1, $p2, $p3))
    $roofBrush.Dispose()

    # House Body
    $bodyBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 79, 70, 229))
    $bodyRect = New-Object System.Drawing.Rectangle([int]($sz * 0.22), [int]($sz * 0.44), [int]($sz * 0.56), [int]($sz * 0.36))
    $g.FillRectangle($bodyBrush, $bodyRect)
    $bodyBrush.Dispose()

    # Door
    $doorBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 10, 8, 32))
    $doorRect = New-Object System.Drawing.Rectangle([int]($sz * 0.42), [int]($sz * 0.56), [int]($sz * 0.16), [int]($sz * 0.24))
    $g.FillRectangle($doorBrush, $doorRect)
    $doorBrush.Dispose()

    # Windows
    $winBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 165, 180, 252))
    $win1 = New-Object System.Drawing.Rectangle([int]($sz * 0.27), [int]($sz * 0.49), [int]($sz * 0.11), [int]($sz * 0.11))
    $win2 = New-Object System.Drawing.Rectangle([int]($sz * 0.62), [int]($sz * 0.49), [int]($sz * 0.11), [int]($sz * 0.11))
    $g.FillRectangle($winBrush, $win1)
    $g.FillRectangle($winBrush, $win2)
    $winBrush.Dispose()

    # Bottom Text "SHIVAM"
    $fontSize = [float]([Math]::Max(6.0, $sz * 0.085))
    $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $textRect = New-Object System.Drawing.RectangleF(0.0, [float]($sz * 0.81), [float]$sz, [float]($sz * 0.17))
    $g.DrawString("SHIVAM", $font, $textBrush, $textRect, $sf)
    $font.Dispose()
    $textBrush.Dispose()

    $g.Dispose()
    $filePath = Join-Path $outDir ("icon-" + $sz + ".png")
    $bmp.Save($filePath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Created valid PNG: $filePath ($sz x $sz)"
}

# Also create screenshot-mobile.png (390x844)
$sw = 390
$sh = 844
$screenBmp = New-Object System.Drawing.Bitmap($sw, $sh)
$sg = [System.Drawing.Graphics]::FromImage($screenBmp)
$srect = New-Object System.Drawing.Rectangle(0, 0, $sw, $sh)
$sbrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($srect, [System.Drawing.Color]::FromArgb(255, 10, 8, 32), [System.Drawing.Color]::FromArgb(255, 15, 13, 46), 90.0)
$sg.FillRectangle($sbrush, $srect)
$sbrush.Dispose()
$titleFont = New-Object System.Drawing.Font("Arial", 22.0, [System.Drawing.FontStyle]::Bold)
$titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$ssf = New-Object System.Drawing.StringFormat
$ssf.Alignment = [System.Drawing.StringAlignment]::Center
$sg.DrawString("SHIVAM DUPLEX", $titleFont, $titleBrush, (New-Object System.Drawing.RectangleF(0, 100, $sw, 50)), $ssf)
$titleFont.Dispose()
$titleBrush.Dispose()
$sg.Dispose()
$screenPath = Join-Path $outDir "screenshot-mobile.png"
$screenBmp.Save($screenPath, [System.Drawing.Imaging.ImageFormat]::Png)
$screenBmp.Dispose()
Write-Host "Created screenshot: $screenPath"
