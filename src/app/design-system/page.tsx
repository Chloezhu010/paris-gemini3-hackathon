'use client';

import { Button, Card, CardHeader, CardContent, Input, Badge } from '@/components/ui';
import React, { useState } from 'react';

export default function DesignSystemPage() {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="container-narrow">
        {/* Header */}
        <div className="mb-4xl">
          <h1 className="text-heading-1 mb-md text-slate-900 dark:text-white">
            Design System Showcase
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Explore the component library and design tokens
          </p>
        </div>

        {/* Colors Section */}
        <section className="mb-4xl">
          <h2 className="text-heading-2 mb-2xl text-slate-900 dark:text-white">
            Color Palette
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {/* Primary */}
            <Card>
              <CardHeader>
                <h3 className="text-heading-4">Primary</h3>
              </CardHeader>
              <CardContent className="space-y-md">
                <div className="flex items-center gap-md">
                  <div className="w-16 h-16 rounded-lg bg-primary-500" />
                  <div>
                    <p className="text-sm font-mono text-slate-600 dark:text-slate-400">
                      #0ea5e9
                    </p>
                    <p className="text-xs text-slate-500">Sky Blue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accent */}
            <Card>
              <CardHeader>
                <h3 className="text-heading-4">Accent</h3>
              </CardHeader>
              <CardContent className="space-y-md">
                <div className="flex items-center gap-md">
                  <div className="w-16 h-16 rounded-lg bg-accent-500" />
                  <div>
                    <p className="text-sm font-mono text-slate-600 dark:text-slate-400">
                      #22c55e
                    </p>
                    <p className="text-xs text-slate-500">Fresh Green</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Neutral */}
            <Card>
              <CardHeader>
                <h3 className="text-heading-4">Neutral</h3>
              </CardHeader>
              <CardContent className="space-y-md">
                <div className="flex items-center gap-md">
                  <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-700" />
                  <div>
                    <p className="text-sm font-mono text-slate-600 dark:text-slate-400">
                      #e2e8f0
                    </p>
                    <p className="text-xs text-slate-500">Slate 200</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="mb-4xl">
          <h2 className="text-heading-2 mb-2xl text-slate-900 dark:text-white">
            Buttons
          </h2>
          <Card>
            <CardContent>
              <div className="space-y-lg">
                <div className="space-y-md">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Primary</p>
                  <div className="flex flex-wrap gap-md">
                    <Button variant="primary" size="sm">
                      Small
                    </Button>
                    <Button variant="primary" size="md">
                      Medium
                    </Button>
                    <Button variant="primary" size="lg">
                      Large
                    </Button>
                    <Button variant="primary" disabled>
                      Disabled
                    </Button>
                    <Button variant="primary" isLoading>
                      Loading
                    </Button>
                  </div>
                </div>

                <div className="divider" />

                <div className="space-y-md">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Secondary</p>
                  <div className="flex flex-wrap gap-md">
                    <Button variant="secondary" size="sm">
                      Small
                    </Button>
                    <Button variant="secondary" size="md">
                      Medium
                    </Button>
                    <Button variant="secondary" size="lg">
                      Large
                    </Button>
                  </div>
                </div>

                <div className="divider" />

                <div className="space-y-md">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Ghost</p>
                  <div className="flex flex-wrap gap-md">
                    <Button variant="ghost" size="sm">
                      Small
                    </Button>
                    <Button variant="ghost" size="md">
                      Medium
                    </Button>
                    <Button variant="ghost" size="lg">
                      Large
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Input Section */}
        <section className="mb-4xl">
          <h2 className="text-heading-2 mb-2xl text-slate-900 dark:text-white">
            Form Inputs
          </h2>
          <Card>
            <CardContent className="space-y-lg">
              <Input
                label="Feature Description"
                placeholder="e.g., Email subscription popup"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                helperText="Describe the feature you want to research"
              />

              <Input
                label="URL Input"
                type="url"
                placeholder="https://example.com"
                helperText="Provide a website URL for direct analysis"
              />

              <Input
                label="Error State"
                placeholder="This has an error"
                error="This field is required"
              />
            </CardContent>
          </Card>
        </section>

        {/* Badges Section */}
        <section className="mb-4xl">
          <h2 className="text-heading-2 mb-2xl text-slate-900 dark:text-white">
            Badges
          </h2>
          <Card>
            <CardContent>
              <div className="space-y-lg">
                <div className="space-y-md">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Variants
                  </p>
                  <div className="flex flex-wrap gap-md">
                    <Badge variant="primary">User Flow</Badge>
                    <Badge variant="accent">Pattern</Badge>
                    <Badge variant="secondary">Reference</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="error">Error</Badge>
                  </div>
                </div>

                <div className="divider" />

                <div className="space-y-md">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Sizes</p>
                  <div className="flex flex-wrap gap-md items-center">
                    <Badge variant="primary" size="sm">
                      Small
                    </Badge>
                    <Badge variant="primary" size="md">
                      Medium
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Cards Section */}
        <section className="mb-4xl">
          <h2 className="text-heading-2 mb-2xl text-slate-900 dark:text-white">
            Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <Card hoverable variant="default">
              <CardHeader>
                <h3 className="text-heading-4">Default Card</h3>
              </CardHeader>
              <CardContent>
                <p className="text-body text-slate-600 dark:text-slate-400">
                  Standard card with border and subtle shadow
                </p>
              </CardContent>
            </Card>

            <Card hoverable variant="elevated">
              <CardHeader>
                <h3 className="text-heading-4">Elevated Card</h3>
              </CardHeader>
              <CardContent>
                <p className="text-body text-slate-600 dark:text-slate-400">
                  Card with stronger shadow for emphasis
                </p>
              </CardContent>
            </Card>

            <Card hoverable variant="outlined">
              <CardHeader>
                <h3 className="text-heading-4">Outlined Card</h3>
              </CardHeader>
              <CardContent>
                <p className="text-body text-slate-600 dark:text-slate-400">
                  Card with thicker border and no shadow
                </p>
              </CardContent>
            </Card>

            <Card hoverable>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <h3 className="text-heading-4">With Badges</h3>
                  <Badge variant="accent">Live</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-body text-slate-600 dark:text-slate-400 mb-md">
                  Cards can include badges and other components
                </p>
                <div className="flex gap-md flex-wrap">
                  <Badge variant="primary">Design Pattern</Badge>
                  <Badge variant="secondary">Reference</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Spacing Section */}
        <section className="mb-4xl">
          <h2 className="text-heading-2 mb-2xl text-slate-900 dark:text-white">
            Spacing System
          </h2>
          <Card>
            <CardContent className="space-y-2xl">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-md">
                  XS (4px)
                </p>
                <div className="flex gap-xs">
                  <div className="w-12 h-12 bg-primary-500 rounded" />
                  <div className="w-12 h-12 bg-primary-500 rounded" />
                  <div className="w-12 h-12 bg-primary-500 rounded" />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-md">
                  MD (12px)
                </p>
                <div className="flex gap-md">
                  <div className="w-12 h-12 bg-accent-500 rounded" />
                  <div className="w-12 h-12 bg-accent-500 rounded" />
                  <div className="w-12 h-12 bg-accent-500 rounded" />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-md">
                  LG (16px)
                </p>
                <div className="flex gap-lg">
                  <div className="w-12 h-12 bg-slate-400 rounded" />
                  <div className="w-12 h-12 bg-slate-400 rounded" />
                  <div className="w-12 h-12 bg-slate-400 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Typography Section */}
        <section className="mb-4xl">
          <h2 className="text-heading-2 mb-2xl text-slate-900 dark:text-white">
            Typography
          </h2>
          <Card>
            <CardContent className="space-y-2xl">
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-sm">
                  Heading 1
                </p>
                <h1 className="text-heading-1">This is a heading 1</h1>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-sm">
                  Heading 2
                </p>
                <h2 className="text-heading-2">This is a heading 2</h2>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-sm">
                  Heading 3
                </p>
                <h3 className="text-heading-3">This is a heading 3</h3>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-sm">
                  Body
                </p>
                <p className="text-body">
                  This is a body paragraph. It should be used for main content and descriptions.
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-sm">
                  Body Small
                </p>
                <p className="text-body-sm">This is a small body text used for secondary information</p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-sm">
                  Caption
                </p>
                <p className="text-caption">This is a caption for labels and metadata</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
