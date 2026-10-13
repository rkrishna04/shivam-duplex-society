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

    # Background gradient: Cosmic Deep Navy & Royal Indigo
    $rect = New-Object System.Drawing.Rectangle(0, 0, $sz, $sz)
    $c1 = [System.Drawing.Color]::FromArgb(255, 8, 6, 28)
    $c2 = [System.Drawing.Color]::FromArgb(255, 22, 14, 66)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 45.0)
    $g.FillRectangle($brush, $rect)
    $brush.Dispose()

    # Divine Cosmic Aura (Pulsating outer glow)
    $auraBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(90, 79, 70, 229),
        [System.Drawing.Color]::FromArgb(40, 245, 158, 11),
        90.0
    )
    $g.FillEllipse($auraBrush, [int]($sz * 0.12), [int]($sz * 0.08), [int]($sz * 0.76), [int]($sz * 0.76))
    $auraBrush.Dispose()

    # Outer Rounded Border with Gold accent
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 251, 191, 36), [float]([Math]::Max(1.5, $sz * 0.025)))
    $g.DrawRectangle($borderPen, [int]($sz * 0.04), [int]($sz * 0.04), [int]($sz * 0.92), [int]($sz * 0.92))
    $borderPen.Dispose()

    # --- LORD SHIVA TRISHUL (Divine Golden Trident) ---
    $cx = [float]($sz * 0.50)
    $goldBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(255, 254, 240, 138),
        [System.Drawing.Color]::FromArgb(255, 245, 158, 11),
        90.0
    )
    $goldPen = New-Object System.Drawing.Pen($goldBrush, [float]([Math]::Max(2.0, $sz * 0.045)))
    $goldPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $goldPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

    # Center Shaft (stem) of Trishul
    $g.DrawLine($goldPen, $cx, [float]($sz * 0.18), $cx, [float]($sz * 0.78))

    # Center Blade Point (Top spearhead)
    $pTop1 = New-Object System.Drawing.PointF($cx, [float]($sz * 0.12))
    $pTop2 = New-Object System.Drawing.PointF([float]($cx - $sz * 0.05), [float]($sz * 0.22))
    $pTop3 = New-Object System.Drawing.PointF([float]($cx + $sz * 0.05), [float]($sz * 0.22))
    $g.FillPolygon($goldBrush, @($pTop1, $pTop2, $pTop3))

    # Left Curved Trident Prong
    $pL1 = New-Object System.Drawing.PointF([float]($cx - $sz * 0.02), [float]($sz * 0.38))
    $pL2 = New-Object System.Drawing.PointF([float]($cx - $sz * 0.24), [float]($sz * 0.36))
    $pL3 = New-Object System.Drawing.PointF([float]($cx - $sz * 0.22), [float]($sz * 0.20))
    $g.DrawBezier($goldPen, $pL1, (New-Object System.Drawing.PointF([float]($cx - $sz * 0.16), [float]($sz * 0.44))), (New-Object System.Drawing.PointF([float]($cx - $sz * 0.26), [float]($sz * 0.30))), $pL3)

    # Left Spear tip
    $g.FillPolygon($goldBrush, @(
        $pL3,
        (New-Object System.Drawing.PointF([float]($cx - $sz * 0.26), [float]($sz * 0.24))),
        (New-Object System.Drawing.PointF([float]($cx - $sz * 0.18), [float]($sz * 0.24)))
    ))

    # Right Curved Trident Prong
    $pR1 = New-Object System.Drawing.PointF([float]($cx + $sz * 0.02), [float]($sz * 0.38))
    $pR2 = New-Object System.Drawing.PointF([float]($cx + $sz * 0.24), [float]($sz * 0.36))
    $pR3 = New-Object System.Drawing.PointF([float]($cx + $sz * 0.22), [float]($sz * 0.20))
    $g.DrawBezier($goldPen, $pR1, (New-Object System.Drawing.PointF([float]($cx + $sz * 0.16), [float]($sz * 0.44))), (New-Object System.Drawing.PointF([float]($cx + $sz * 0.26), [float]($sz * 0.30))), $pR3)

    # Right Spear tip
    $g.FillPolygon($goldBrush, @(
        $pR3,
        (New-Object System.Drawing.PointF([float]($cx + $sz * 0.18), [float]($sz * 0.24))),
        (New-Object System.Drawing.PointF([float]($cx + $sz * 0.26), [float]($sz * 0.24)))
    ))

    # --- DAMRU (Sacred Drum in center of Trishul) ---
    $dTop = [float]($sz * 0.46)
    $dMid = [float]($sz * 0.52)
    $dBot = [float]($sz * 0.58)
    $dw = [float]($sz * 0.10)
    $damruBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 239, 68, 68)) # Sacred Red
    $g.FillPolygon($damruBrush, @(
        (New-Object System.Drawing.PointF([float]($cx - $dw), $dTop)),
        (New-Object System.Drawing.PointF([float]($cx + $dw), $dTop)),
        (New-Object System.Drawing.PointF($cx, $dMid))
    ))
    $g.FillPolygon($damruBrush, @(
        (New-Object System.Drawing.PointF($cx, $dMid)),
        (New-Object System.Drawing.PointF([float]($cx + $dw), $dBot)),
        (New-Object System.Drawing.PointF([float]($cx - $dw), $dBot))
    ))
    $damruBrush.Dispose()

    # Center Bindu / Golden band around Damru
    $bandPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 253, 224, 71), [float]([Math]::Max(1.5, $sz * 0.02)))
    $g.DrawLine($bandPen, [float]($cx - $dw * 0.4), $dMid, [float]($cx + $dw * 0.4), $dMid)
    $bandPen.Dispose()

    # --- CRESCENT MOON (Ardha Chandra) ---
    $moonPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(240, 224, 231, 255), [float]([Math]::Max(1.5, $sz * 0.03)))
    $g.DrawArc($moonPen, [float]($cx + $sz * 0.06), [float]($sz * 0.14), [float]($sz * 0.18), [float]($sz * 0.18), 120.0, 180.0)
    $moonPen.Dispose()

    $goldPen.Dispose()
    $goldBrush.Dispose()

    # --- Text: "SHIVAM" ---
    $fontSize = [float]([Math]::Max(7.0, $sz * 0.09))
    $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 254, 240, 138))
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
    Write-Host "Created Lord Shiva PWA Icon: $filePath ($sz x $sz)"
}

Write-Host "All Lord Shiva PWA icons successfully generated!"
