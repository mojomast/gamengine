/**
 * Enhanced Text Rendering System
 * Provides advanced text display with typewriter effects, formatting, and styling
 */
class TextRenderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.defaultFont = '16px monospace';
        this.defaultColor = '#ffffff';
        this.lineHeight = 20;
        this.charWidth = 8; // Approximate character width for monospace
    }

    renderText(text, x, y, options = {}) {
        const {
            font = this.defaultFont,
            color = this.defaultColor,
            align = 'left',
            baseline = 'top',
            maxWidth = null,
            wrap = true,
            shadow = false,
            shadowColor = 'rgba(0, 0, 0, 0.5)',
            shadowOffsetX = 1,
            shadowOffsetY = 1
        } = options;

        this.ctx.save();

        // Set font and basic properties
        this.ctx.font = font;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = baseline;

        // Handle text wrapping if needed
        let displayText = text;
        if (wrap && maxWidth) {
            displayText = this.wrapText(text, maxWidth);
        }

        // Render shadow if requested
        if (shadow) {
            this.ctx.fillStyle = shadowColor;
            this.ctx.fillText(displayText, x + shadowOffsetX, y + shadowOffsetY);
        }

        // Render main text
        this.ctx.fillStyle = color;
        this.ctx.fillText(displayText, x, y);

        this.ctx.restore();
    }

    wrapText(text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = this.ctx.measureText(testLine);

            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines.join('\n');
    }

    measureText(text, font = this.defaultFont) {
        this.ctx.save();
        this.ctx.font = font;
        const metrics = this.ctx.measureText(text);
        this.ctx.restore();

        return {
            width: metrics.width,
            height: this.lineHeight,
            actualBoundingBoxAscent: metrics.actualBoundingBoxAscent || 0,
            actualBoundingBoxDescent: metrics.actualBoundingBoxDescent || 0
        };
    }

    splitTextIntoLines(text, maxWidth) {
        return this.wrapText(text, maxWidth).split('\n');
    }
}

class TypewriterEffect {
    constructor() {
        this.text = '';
        this.displayText = '';
        this.currentCharIndex = 0;
        this.isPlaying = false;
        this.isComplete = false;
        this.speed = 50; // characters per second
        this.elapsed = 0;
        this.onComplete = null;
        this.onChar = null;
        this.soundEnabled = false;
        this.soundCallback = null;
    }

    start(text, options = {}) {
        this.text = text;
        this.displayText = '';
        this.currentCharIndex = 0;
        this.isPlaying = true;
        this.isComplete = false;
        this.speed = options.speed || 50;
        this.elapsed = 0;
        this.onComplete = options.onComplete || null;
        this.onChar = options.onChar || null;
        this.soundEnabled = options.soundEnabled || false;
        this.soundCallback = options.soundCallback || null;
    }

    update(deltaTime) {
        if (!this.isPlaying || this.isComplete) return;

        this.elapsed += deltaTime;

        const charsToAdd = Math.floor(this.elapsed * this.speed);
        if (charsToAdd > this.currentCharIndex) {
            const newChars = charsToAdd - this.currentCharIndex;
            for (let i = 0; i < newChars && this.currentCharIndex < this.text.length; i++) {
                this.currentCharIndex++;
                this.displayText = this.text.substring(0, this.currentCharIndex);

                // Call character callback
                if (this.onChar) {
                    this.onChar(this.text[this.currentCharIndex - 1], this.currentCharIndex - 1);
                }

                // Play sound if enabled
                if (this.soundEnabled && this.soundCallback) {
                    this.soundCallback();
                }
            }
        }

        if (this.currentCharIndex >= this.text.length) {
            this.complete();
        }
    }

    complete() {
        this.displayText = this.text;
        this.currentCharIndex = this.text.length;
        this.isPlaying = false;
        this.isComplete = true;

        if (this.onComplete) {
            this.onComplete();
        }
    }

    skip() {
        this.complete();
    }

    pause() {
        this.isPlaying = false;
    }

    resume() {
        if (!this.isComplete) {
            this.isPlaying = true;
        }
    }

    reset() {
        this.displayText = '';
        this.currentCharIndex = 0;
        this.elapsed = 0;
        this.isPlaying = false;
        this.isComplete = false;
    }

    getProgress() {
        return this.text.length > 0 ? this.currentCharIndex / this.text.length : 1;
    }

    isFinished() {
        return this.isComplete;
    }
}

class FormattedTextRenderer extends TextRenderer {
    constructor(ctx) {
        super(ctx);
        this.formatTags = {
            'b': { fontWeight: 'bold' },
            'i': { fontStyle: 'italic' },
            'u': { textDecoration: 'underline' },
            'color': { color: null },
            'size': { fontSize: null },
            'font': { fontFamily: null }
        };
    }

    renderFormattedText(text, x, y, options = {}) {
        const tokens = this.parseFormattedText(text);
        let currentX = x;
        let currentY = y;
        const maxWidth = options.maxWidth || null;

        this.ctx.save();

        // Default style
        this.applyTextStyle({
            fontWeight: 'normal',
            fontStyle: 'normal',
            color: options.color || this.defaultColor,
            fontSize: parseInt(options.font) || 16,
            fontFamily: 'monospace'
        });

        for (const token of tokens) {
            if (token.type === 'text') {
                const lines = maxWidth ? this.splitTextIntoLines(token.content, maxWidth) : [token.content];

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];

                    // Move to next line if not first line
                    if (i > 0) {
                        currentX = x;
                        currentY += this.lineHeight;
                    }

                    // Check if we need to wrap within the line
                    if (maxWidth && this.ctx.measureText(line).width > maxWidth) {
                        const wrappedLines = this.splitTextIntoLines(line, maxWidth);
                        for (let j = 0; j < wrappedLines.length; j++) {
                            if (j > 0) {
                                currentX = x;
                                currentY += this.lineHeight;
                            }
                            this.renderTextSegment(wrappedLines[j], currentX, currentY, options);
                            currentX += this.ctx.measureText(wrappedLines[j]).width;
                        }
                    } else {
                        this.renderTextSegment(line, currentX, currentY, options);
                        currentX += this.ctx.measureText(line).width;
                    }
                }
            } else if (token.type === 'tag') {
                this.applyTextStyle(token.style);
            }
        }

        this.ctx.restore();
    }

    parseFormattedText(text) {
        const tokens = [];
        const tagRegex = /<\/?(\w+)(?:\s+([^>]*?))?\s*\/?>/g;
        let lastIndex = 0;
        let match;

        // Stack to keep track of nested tags
        const styleStack = [];

        while ((match = tagRegex.exec(text)) !== null) {
            // Add text before the tag
            if (match.index > lastIndex) {
                tokens.push({
                    type: 'text',
                    content: text.substring(lastIndex, match.index)
                });
            }

            const tagName = match[1].toLowerCase();
            const attributes = this.parseAttributes(match[2] || '');
            const isClosing = match[0].startsWith('</');
            const isSelfClosing = match[0].endsWith('/>') || match[0].includes('/>');

            if (isClosing) {
                // Pop style from stack
                if (styleStack.length > 0) {
                    styleStack.pop();
                }
            } else {
                // Apply new style
                const style = this.getTagStyle(tagName, attributes);
                if (style) {
                    styleStack.push(style);
                }

                if (!isSelfClosing) {
                    tokens.push({
                        type: 'tag',
                        name: tagName,
                        style: this.combineStyles(styleStack),
                        isOpening: true
                    });
                }
            }

            lastIndex = tagRegex.lastIndex;
        }

        // Add remaining text
        if (lastIndex < text.length) {
            tokens.push({
                type: 'text',
                content: text.substring(lastIndex)
            });
        }

        return tokens;
    }

    parseAttributes(attrString) {
        const attributes = {};
        const attrRegex = /(\w+)="([^"]*)"/g;
        let attrMatch;

        while ((attrMatch = attrRegex.exec(attrString)) !== null) {
            attributes[attrMatch[1]] = attrMatch[2];
        }

        return attributes;
    }

    getTagStyle(tagName, attributes) {
        const baseStyle = this.formatTags[tagName];
        if (!baseStyle) return null;

        const style = { ...baseStyle };

        // Apply attributes
        if (tagName === 'color' && attributes.color) {
            style.color = attributes.color;
        }
        if (tagName === 'size' && attributes.size) {
            style.fontSize = parseInt(attributes.size);
        }
        if (tagName === 'font' && attributes.family) {
            style.fontFamily = attributes.family;
        }

        return style;
    }

    combineStyles(styleStack) {
        return Object.assign({}, ...styleStack);
    }

    applyTextStyle(style) {
        if (style.fontWeight && style.fontStyle && style.fontSize && style.fontFamily) {
            this.ctx.font = `${style.fontWeight} ${style.fontStyle} ${style.fontSize}px ${style.fontFamily}`;
        }
        if (style.color) {
            this.ctx.fillStyle = style.color;
        }
    }

    renderTextSegment(text, x, y, options) {
        this.ctx.fillText(text, x, y);
    }
}

class TextBubble extends FormattedTextRenderer {
    constructor(x, y, width, height) {
        super(null); // Will set ctx later
        this.position = { x, y };
        this.size = { width, height };
        this.padding = 10;
        this.borderRadius = 8;
        this.visible = false;

        // Typewriter effect
        this.typewriter = new TypewriterEffect();

        // Styling
        this.style = {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: '#ffd700',
            borderWidth: 2,
            textColor: '#ffffff',
            font: '16px monospace'
        };

        // Content
        this.speaker = '';
        this.text = '';
        this.portrait = null;
    }

    setContext(ctx) {
        this.ctx = ctx;
    }

    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
        this.typewriter.reset();
    }

    setContent(text, speaker = '', portrait = null, options = {}) {
        this.text = text;
        this.speaker = speaker;
        this.portrait = portrait;

        this.typewriter.start(text, {
            speed: options.typewriterSpeed || 50,
            onComplete: options.onComplete,
            onChar: options.onChar,
            soundEnabled: options.soundEnabled,
            soundCallback: options.soundCallback
        });
    }

    update(deltaTime) {
        if (!this.visible) return;
        this.typewriter.update(deltaTime);
    }

    render() {
        if (!this.visible || !this.ctx) return;

        this.ctx.save();

        // Draw background
        this.ctx.fillStyle = this.style.backgroundColor;
        this.roundedRect(
            this.position.x,
            this.position.y,
            this.size.width,
            this.size.height,
            this.borderRadius
        );
        this.ctx.fill();

        // Draw border
        this.ctx.strokeStyle = this.style.borderColor;
        this.ctx.lineWidth = this.style.borderWidth;
        this.roundedRect(
            this.position.x,
            this.position.y,
            this.size.width,
            this.size.height,
            this.borderRadius
        );
        this.ctx.stroke();

        // Draw portrait if available
        let textX = this.position.x + this.padding;
        let textY = this.position.y + this.padding;

        if (this.portrait) {
            const portraitSize = 48;
            this.ctx.drawImage(
                this.portrait,
                this.position.x + this.padding,
                this.position.y + this.padding,
                portraitSize,
                portraitSize
            );
            textX += portraitSize + this.padding;
        }

        // Draw speaker name
        if (this.speaker) {
            this.ctx.fillStyle = '#ffd700';
            this.ctx.font = 'bold 16px monospace';
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'top';
            this.ctx.fillText(`${this.speaker}:`, textX, textY);
            textY += 24;
        }

        // Draw text with typewriter effect
        const maxWidth = this.size.width - textX - this.padding;
        this.renderFormattedText(
            this.typewriter.displayText,
            textX,
            textY,
            {
                maxWidth: maxWidth,
                color: this.style.textColor,
                font: this.style.font
            }
        );

        this.ctx.restore();
    }

    roundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }

    skipTypewriter() {
        this.typewriter.skip();
    }

    isComplete() {
        return this.typewriter.isComplete;
    }
}

export { TextRenderer, TypewriterEffect, FormattedTextRenderer, TextBubble };