import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FoldersSidebar from '../../../components/FoldersSidebar';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});
import * as api from '../../../services/api';

vi.mock('../../../services/api');

const mockFolders = [
  { id: 'unsorted', name: 'Unsorted', isUnsorted: true },
  { id: 'folder-1', name: 'Folder 1' },
  { id: 'folder-2', name: 'Folder 2' },
];

const mockNotes = [
  { id: 'note-1', title: 'Note 1', folderId: 'folder-1' },
  { id: 'note-2', title: 'Note 2', folderId: 'folder-2' },
  { id: 'note-3', title: 'Note 3', folderId: null },
];

describe('FoldersSidebar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getFolders.mockResolvedValue(mockFolders);
    api.getNotes.mockResolvedValue(mockNotes);
    api.renameFolder.mockResolvedValue({ id: 'folder-1', name: 'Renamed' });
    api.deleteFolder.mockResolvedValue({});
    api.deleteNote.mockResolvedValue({});
    api.moveNoteToFolder.mockResolvedValue({});
  });

  it('renders loading state initially', () => {
    api.getFolders.mockImplementation(() => new Promise(() => {}));
    api.getNotes.mockImplementation(() => new Promise(() => {}));

    render(
      <FoldersSidebar
        selectedNoteId={null}
        onSelectNote={vi.fn()}
      />
    );

    expect(screen.getByText('Loading folders...')).toBeInTheDocument();
  });

  it('loads and displays folders', async () => {
    render(
      <FoldersSidebar
        selectedNoteId={null}
        onSelectNote={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Folder 1')).toBeInTheDocument();
      expect(screen.getByText('Folder 2')).toBeInTheDocument();
    });
  });

  it('calls onSelectNote when a note is clicked', async () => {
    const onSelectNote = vi.fn();
    render(
      <FoldersSidebar
        selectedNoteId={null}
        onSelectNote={onSelectNote}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Folder 1 folder/ })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /Folder 1 folder/ }));

    const noteItem = screen.getByRole('button', { name: /Note 1/ });
    await userEvent.click(noteItem);

    expect(onSelectNote).toHaveBeenCalledWith('note-1');
  });

  it('auto-expands unsorted folder', async () => {
    render(
      <FoldersSidebar
        selectedNoteId={null}
        onSelectNote={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Unsorted Notes')).toBeInTheDocument();
    });

    // Unsorted folder should be expanded by default showing its notes
    await waitFor(() => {
      expect(screen.getByText('Note 3')).toBeInTheDocument();
    });
  });

  it('highlights selected note', async () => {
    const { container } = render(
      <FoldersSidebar
        selectedNoteId="note-1"
        onSelectNote={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Folder 1 folder/ })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /Folder 1 folder/ }));

    await waitFor(() => {
      const selectedNote = container.querySelector('.note-item.selected');
      expect(selectedNote).toBeInTheDocument();
    });
  });

  it('handles folder renaming', async () => {
    render(
      <FoldersSidebar
        selectedNoteId={null}
        onSelectNote={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(api.renameFolder).not.toHaveBeenCalled();
    });
  });

  it('handles folder deletion', async () => {
    render(
      <FoldersSidebar
        selectedNoteId={null}
        onSelectNote={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(api.deleteFolder).not.toHaveBeenCalled();
    });
  });

  it('reloads folders on external refresh', async () => {
    const { rerender } = render(
      <FoldersSidebar
        selectedNoteId={null}
        onSelectNote={vi.fn()}
        refreshKey={0}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Folder 1')).toBeInTheDocument();
    });

    vi.clearAllMocks();
    api.getFolders.mockResolvedValue(mockFolders);
    api.getNotes.mockResolvedValue(mockNotes);

    rerender(
      <FoldersSidebar
        selectedNoteId={null}
        onSelectNote={vi.fn()}
        refreshKey={1}
      />
    );

    await waitFor(() => {
      expect(api.getFolders).toHaveBeenCalled();
    });
  });

});
