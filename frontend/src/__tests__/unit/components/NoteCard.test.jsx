import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NoteCard from '../../../components/NoteCard';
import { BrowserRouter } from 'react-router-dom';

describe('NoteCard Component', () => {
  const mockNote = {
    id: '1',
    title: 'Test Note',
    folderName: 'Test Folder',
    preview: 'This is a preview of the note content.',
  };

  it('renders note title', () => {
    render(
      <BrowserRouter>
        <NoteCard note={mockNote} />
      </BrowserRouter>
    );
    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });

  it('renders folder name', () => {
    render(
      <BrowserRouter>
        <NoteCard note={mockNote} />
      </BrowserRouter>
    );
    expect(screen.getByText(/Folder: Test Folder/)).toBeInTheDocument();
  });

  it('renders preview text', () => {
    render(
      <BrowserRouter>
        <NoteCard note={mockNote} />
      </BrowserRouter>
    );
    expect(screen.getByText('This is a preview of the note content.')).toBeInTheDocument();
  });

  it('renders open note link', () => {
    render(
      <BrowserRouter>
        <NoteCard note={mockNote} />
      </BrowserRouter>
    );
    const link = screen.getByRole('link', { name: /Open Note/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/notes/1');
  });

  it('shows "Unassigned" when folder is null', () => {
    const noteWithoutFolder = { ...mockNote, folderName: null };
    render(
      <BrowserRouter>
        <NoteCard note={noteWithoutFolder} />
      </BrowserRouter>
    );
    expect(screen.getByText(/Folder: Unassigned/)).toBeInTheDocument();
  });

  it('renders as article element', () => {
    const { container } = render(
      <BrowserRouter>
        <NoteCard note={mockNote} />
      </BrowserRouter>
    );
    const article = container.querySelector('article.note-card');
    expect(article).toBeInTheDocument();
  });
});
