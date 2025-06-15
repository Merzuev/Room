document.addEventListener('DOMContentLoaded', function() {
    var recentActions = document.getElementById('recent-actions');

    if (recentActions) {
        var header = recentActions.querySelector('h2');
        var content = recentActions.querySelector('.module ul');

        // Если элементы не найдены, выходим
        if (!header || !content) {
            return;
        }

        // Устанавливаем начальную max-height для анимации
        content.style.maxHeight = content.scrollHeight + 'px'; // Устанавливаем высоту, чтобы она была известна для анимации
        content.style.transition = 'max-height 0.3s ease-out, opacity 0.3s ease-out, padding 0.3s ease-out';
        content.style.overflow = 'hidden';


        // Проверяем, есть ли сохраненное состояние в localStorage
        var isCollapsed = localStorage.getItem('recentActionsCollapsed');

        // Применяем начальное состояние
        if (isCollapsed === 'true') {
            recentActions.classList.add('collapsed');
            content.style.maxHeight = '0';
            content.style.opacity = '0';
            content.style.paddingTop = '0';
            content.style.paddingBottom = '0';
        } else {
            recentActions.classList.remove('collapsed');
            content.style.maxHeight = content.scrollHeight + 'px'; // Убедимся, что высота актуальна
            content.style.opacity = '1';
            // После анимации, установим max-height на 'none'
            content.addEventListener('transitionend', function handler() {
                if (!recentActions.classList.contains('collapsed')) {
                    content.style.maxHeight = 'none';
                }
                content.removeEventListener('transitionend', handler);
            });
        }

        header.addEventListener('click', function() {
            if (recentActions.classList.contains('collapsed')) {
                recentActions.classList.remove('collapsed');
                // Устанавливаем max-height динамически, чтобы анимация работала
                content.style.maxHeight = content.scrollHeight + 'px';
                content.style.opacity = '1';
                content.style.paddingTop = '8px'; // Возвращаем исходный паддинг, если был
                content.style.paddingBottom = '8px'; // Возвращаем исходный паддинг, если был
                localStorage.setItem('recentActionsCollapsed', 'false');

                // После завершения анимации, убираем max-height,
                // чтобы контент мог свободно расширяться, если он изменяется
                content.addEventListener('transitionend', function handler() {
                    if (!recentActions.classList.contains('collapsed')) {
                        content.style.maxHeight = 'none';
                    }
                    content.removeEventListener('transitionend', handler);
                });

            } else {
                recentActions.classList.add('collapsed');
                content.style.maxHeight = content.scrollHeight + 'px'; // Сначала задаем текущую высоту
                // Ждем следующего кадра анимации, чтобы применить 0
                requestAnimationFrame(function() {
                    content.style.maxHeight = '0';
                    content.style.opacity = '0';
                    content.style.paddingTop = '0';
                    content.style.paddingBottom = '0';
                });
                localStorage.setItem('recentActionsCollapsed', 'true');
            }
        });
    }

    // --- JavaScript для адаптации таблиц (changelist) ---
    // Добавляем атрибут data-label к каждой ячейке таблицы для мобильной адаптации
    var changeListTable = document.querySelector('#changelist table');
    if (changeListTable) {
        var headers = changeListTable.querySelectorAll('thead th');
        var rows = changeListTable.querySelectorAll('tbody tr');

        rows.forEach(function(row) {
            var cells = row.querySelectorAll('td');
            cells.forEach(function(cell, index) {
                if (headers[index]) {
                    // Используем textContent заголовка как data-label
                    cell.setAttribute('data-label', headers[index].textContent.trim() + ':');
                }
            });
        });
    }
});